import json
import boto3
import uuid
import mimetypes
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db.models import Sum

from .models import Section, StoreSales
from thingsboard_admin.utils import TBAPI


from .utils import get_user


def get_section(device_id, access_token):
    if not device_id:
        return None, Response(status=status.HTTP_400_BAD_REQUEST, data={'message': 'device_id is required.'})

    if not access_token:
        return None, Response(status=status.HTTP_400_BAD_REQUEST, data={'message': 'access_token is required.'})

    try:
        section = Section.objects.get(device_id=device_id)
    except Section.DoesNotExist:
        tb_api = TBAPI()
        device_credentials = tb_api.get_device_credentials(device_id)
        if not device_credentials:
            return None, Response(status=status.HTTP_404_NOT_FOUND, data={'message': 'device_id is invalid.'})
        section = Section.objects.create(device_id=device_id, access_token=device_credentials['credentialsId'])

    if section.access_token != access_token:
        return None, Response(status=status.HTTP_400_BAD_REQUEST, data={'message': 'access_token is invalid.'})

    return section, None


class SectionView(APIView):
    def get(self, request):
        device_id = request.GET.get('device_id')
        access_token = request.META.get('HTTP_ACCESS_TOKEN')
        section, result = get_section(device_id, access_token)
        if not section:
            return result
        data = None
        try:
            data = json.loads(section.data)
        except Exception:
            pass

        image_path = section.image_path
        if image_path:
            s3_client = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                     region_name=settings.AWS_REGION)
            image_path = s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                    'Key': image_path
                },
                ExpiresIn=3600
            )

        return Response(data={'data': data, 'image_path': image_path, 'device_id': section.device_id})

    def post(self, request):
        device_id = request.data.get('device_id')
        access_token = request.META.get('HTTP_ACCESS_TOKEN')
        section, result = get_section(device_id, access_token)
        if not section:
            return result
        section.data = json.dumps(request.data.get('data'))
        section.save()
        return Response(status=status.HTTP_201_CREATED)


class SectionImagePresignedPostView(APIView):
    def get(self, request):
        device_id = request.GET.get('device_id')
        access_token = request.META.get('HTTP_ACCESS_TOKEN')
        section, result = get_section(device_id, access_token)
        if not section:
            return result

        s3_client = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                 aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                 region_name=settings.AWS_REGION)
        file_name = request.GET.get('file_name')
        key = 'retail/{}/{}_{}'.format(device_id, str(uuid.uuid4()), file_name)

        file_type = mimetypes.guess_type(file_name)[0]
        presigned_post = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
            Fields={'Content-Type': file_type},
            Conditions=[
                {'Content-Type': file_type}
            ],
            ExpiresIn=3600
        )

        section.image_path = key
        section.save()
        return Response(data={'data': presigned_post})


class SalesInfoAPIView(APIView):
    def post(self, request):
        if not get_user(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        stores = request.data.get('stores')
        date_from = request.data.get('from')
        date_to = request.data.get('to')
        query = StoreSales.objects.filter(device_id__in=stores)
        if date_from:
            query = query.filter(date__gte=datetime.utcfromtimestamp(date_from).date())
        if date_to:
            query = query.filter(date__lte=datetime.utcfromtimestamp(date_to).date())
        data = query.aggregate(total=Sum('number_of_customers'))
        if not data['total']:
            data['total'] = 0
        return Response(data=data, status=status.HTTP_200_OK)
