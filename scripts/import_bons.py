from retail.utils import import_bons


def run(*script_args):
    # script for generating csv for bulk keyword upload report
    try:
        csv_path = script_args[0]
    except Exception:
        print('Csv file path is required')
        return
    import_bons(csv_path)

