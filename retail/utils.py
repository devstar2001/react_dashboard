import csv
import jwt
from datetime import datetime
from django.conf import settings
from .models import Store, StoreSales


def import_bons(csv_path):
    stores = {}
    for store in Store.objects.all():
        stores[store.store_name] = store.device_id

    store_sales = []

    with open(csv_path) as file:
        csv_reader = csv.reader(file, delimiter=';')

        # skip header
        next(csv_reader)

        for row in csv_reader:
            try:
                date = datetime.strptime(row[0].strip(), '%d.%m.%Y').date()
                store_name = row[2].strip()
                count = int(row[3].strip())
            except Exception:
                print("An Error occurred while processing this row %s. " % csv_reader.line_num)
                print(row)
                return
            store_sales.append(StoreSales(device_id=stores[store_name], date=date, number_of_customers=count))

    StoreSales.objects.bulk_create(store_sales)
    print('Successfully processed.')


def get_user(request):
    token = request.META.get('HTTP_X_AUTHORIZATION')
    if not token or not token.startswith("Bearer"):
        return None
    token = token[7:]
    try:
        user = jwt.decode(token, key=settings.JWT_SECRET_KEY, verify=False)
        if datetime.utcnow() < datetime.utcfromtimestamp(user['exp']):
            return user
        else:
            return None
    except Exception:
        return None
