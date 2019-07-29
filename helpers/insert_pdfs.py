#!/usr/bin/env python3

import os
from pathlib import Path
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['jazzy']

sheets = []
book = 'Real-book-6'
pathlist = Path(book).glob('**/*.pdf')
for path in pathlist:
     # because path is object not string
    #  path_in_str = str(path)
    pdf = os.path.basename(path)
    in_file = open(path, "rb")
    sheets.append({
      'filename': pdf,
      'source': book,
      'contents': in_file.read(),
    })

new_result = db.sheets.insert_many(sheets)
print('Multiple posts: {0}'.format(new_result.inserted_ids))