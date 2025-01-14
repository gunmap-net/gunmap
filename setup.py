import argparse, subprocess, requests, sqlite3, os, urllib, shutil, re

def defineArgs():
    argparser = argparse.ArgumentParser(description="Script to load local GUNMAP with values from Baserow")
    argparser.add_argument("-d", "--dev", action='store_true', help="Run in dev mode (required for tests to pass)")
    return argparser.parse_args()

def format_multivalue_field(field, field_vals):
    for f in field:
        fid = f['id']
        fval = f['value']

        if fid not in field_vals.keys():
            field_vals[fid] = fval

def insert_multivalue_field(cur, fieldname_plural, fieldname_singular, field_vals):
    cur.execute("""
    CREATE TABLE {} (
        id INTEGER PRIMARY KEY, 
        value TEXT
    )
    """.format(fieldname_plural))

    cur.execute("""
    CREATE TABLE entity_{} (
        {}_id INTEGER, 
        entity_id INTEGER
    )
    """.format(fieldname_singular, fieldname_singular))

    for fid, fval in field_vals.items():
        cur.execute( """
            INSERT INTO {} 
                (id, value)
            VALUES (?, ?)
            """.format(fieldname_plural), (fid, fval))

def insert_field_links(cur, fieldname, fieldvals, id):
    field_values = []
    for f in fieldvals:
        query = """
            INSERT INTO entity_{} ({}_id, entity_id)
            VALUES (?, ?)
        """.format(fieldname, fieldname)
        field_values.append(f['value'])
        cur.execute(query, (f['id'], id))
    return field_values

#START
args = defineArgs()

try:
    os.remove("gunmap_site/themes/gunmapTheme/static/gunmap.db")
except:
    #Do nothing
    pass 

try:
    shutil.rmtree('gunmap_site/content/entities')
except:
    #Do nothing
    pass 

os.mkdir("gunmap_site/content/entities")
con = sqlite3.connect("gunmap_site/themes/gunmapTheme/static/gunmap.db")

cur = con.cursor()

if args.dev:
    res = requests.get("http://127.0.0.1:8999/api/get_most_recent_ten_dev/")
else:
    res = requests.get("http://127.0.0.1:8999/api/get_most_recent_entities/?size=all")

rows = res.json()

#INSERT MULTIVALUE FIELDS
authors = {}
organizations = {}
gunmap_categories = {}
munition_types = {}
munition_platforms = {}
munition_parts = {}
munition_calibers = {}
fabrication_methods = {}
diy_levels = {}
entity_formats = {}


for row in rows:
    format_multivalue_field(row['author'], authors)
    format_multivalue_field(row['organization'], organizations)
    format_multivalue_field(row['gunmap_category'], gunmap_categories)
    format_multivalue_field(row['munition_type'], munition_types)
    format_multivalue_field(row['munition_platform'], munition_platforms)
    format_multivalue_field(row['munition_part'], munition_parts)
    format_multivalue_field(row['munition_caliber'], munition_calibers)
    format_multivalue_field(row['fabrication_method'], fabrication_methods)
    format_multivalue_field(row['diy_level'], diy_levels)
    format_multivalue_field(row['entity_format'], entity_formats)

insert_multivalue_field(cur, 'authors', 'author', authors)
insert_multivalue_field(cur, 'organizations', 'organization', organizations)
insert_multivalue_field(cur, 'gunmap_categories', 'gunmap_category', gunmap_categories)
insert_multivalue_field(cur, 'munition_types', 'munition_type', munition_types)
insert_multivalue_field(cur, 'munition_platforms', 'munition_platform', munition_platforms)
insert_multivalue_field(cur, 'munition_parts', 'munition_part', munition_parts)
insert_multivalue_field(cur, 'munition_calibers', 'munition_caliber', munition_calibers)
insert_multivalue_field(cur, 'fabrication_methods', 'fabrication_method', fabrication_methods)
insert_multivalue_field(cur, 'diy_levels', 'diy_level', diy_levels)
insert_multivalue_field(cur, 'entity_formats', 'entity_format', entity_formats)

#INSERT ENTITIES
cur.execute("""
    CREATE TABLE entities (
        id INTEGER PRIMARY KEY, 
        slug TEXT UNIQUE,
        title TEXT, 
        created TEXT, 
        description TEXT,
        thumbnail_url TEXT
    )
    """)

for row in rows:
    parsed_slug = re.sub(r'\W+', '', row['title'].lower().replace(" ", "_"))

    id = row['id']
    slug = parsed_slug
    title = row['title']
    created = row['created']
    authors = row['author']
    organizations = row['organization']
    link = row['link']
    gunmap_categories = row['gunmap_category']
    munition_types = row['munition_type']
    munition_platforms = row['munition_platform']
    munition_parts = row['munition_part']
    munition_calibers = row['munition_caliber']
    fabrication_methods = row['fabrication_method']
    diy_levels = row['diy_level']
    entity_formats = row['entity_format']

    if 'thumbnail_url' in row:
        thumbnail_url = row['thumbnail_url']
    
    description = row['description']

    search_query = """
        SELECT id 
        FROM entities
        WHERE slug = ?
    """
    search_result = cur.execute(search_query, (slug,))
    if search_result.fetchone() is not None:
        slug = "{}_{}".format(slug, id)

    query = """
        INSERT INTO entities 
            (id, slug, title, created, description, thumbnail_url)
        VALUES
            (?,?,?,?,?,?)
        """
    cur.execute(query, (id, slug, title, created, description, thumbnail_url))

    author_vals = insert_field_links(cur, 'author', authors, id)
    organization_vals = insert_field_links(cur, 'organization', organizations, id)
    gunmap_category_vals = insert_field_links(cur, 'gunmap_category', gunmap_categories, id)
    munition_type_vals = insert_field_links(cur, 'munition_type', munition_types, id)
    munition_platform_vals = insert_field_links(cur, 'munition_platform', munition_platforms, id)
    munition_part_vals = insert_field_links(cur, 'munition_part', munition_parts, id)
    munition_caliber_vals = insert_field_links(cur, 'munition_caliber', munition_calibers, id)
    fabrication_method_vals = insert_field_links(cur, 'fabrication_method', fabrication_methods, id)
    diy_level_vals = insert_field_links(cur, 'diy_level', diy_levels, id)
    entity_format_vals = insert_field_links(cur, 'entity_format', entity_formats, id)

    filename = slug if len(slug) <= 256 else id

    with open('gunmap_site/content/entities/{}.md'.format(filename), 'w') as f:
        f.write('---\n')  
        f.write('id: {}\n'.format(id))  
        f.write('slug: "{}"\n'.format(slug.replace("\"", "\\\"")))  
        f.write('title: "{}"\n'.format(title.replace("\"", "\\\"")))
        f.write('date: "{}"\n'.format(created))  
        #f.write('created: "{}"\n'.format(created))  
        f.write('thumbnail_url: "{}"\n'.format(thumbnail_url))

        f.write('authors:\n')
        for author in author_vals:
            f.write('- {}\n'.format(author))

        f.write('organizations:\n')
        for org in organization_vals:
            f.write('- {}\n'.format(org))

        f.write('gunmap_categories:\n')
        for gc in gunmap_category_vals:
            f.write('- {}\n'.format(gc))

        f.write('munition_types:\n')
        for mt in munition_type_vals:
            f.write('- {}\n'.format(mt))

        f.write('munition_platforms:\n')
        for mp in munition_platform_vals:
            f.write('- {}\n'.format(mp))

        f.write('munition_parts:\n')
        for mp2 in munition_part_vals:
            f.write('- {}\n'.format(mp2))

        f.write('munition_calibers:\n')
        for mc in munition_caliber_vals:
            f.write('- {}\n'.format(mc))

        f.write('fabrication_methods:\n')
        for fm in fabrication_method_vals:
            f.write('- {}\n'.format(fm))

        f.write('diy_levels:\n')
        for dl in diy_level_vals:
            f.write('- {}\n'.format(dl))

        f.write('entity_formats:\n')
        for ef in entity_format_vals:
            f.write('- {}\n'.format(ef))

        f.write('---\n')
        if description:
            f.write(description.replace("\"", "\\\""))


"""
#REQUEST TO LBRY-SDK:
url = 'http://localhost:5279/'
body = {
    "method": "claim_search",
    "params": {
        "channel": "@test-channel-9192022"
    }
}

result = requests.post(url, json=body)
result = result.json()

for item in result['result']['items']:
    claim_id = item['claim_id']
    name = item['name']
    title = item['value']['title']
    guncad_category = ','.join(item['value']['guncad']['guncad_category'])
    firearm_type = ','.join(item['value']['guncad']['firearm_type'])
    firearm_platform = ','.join(item['value']['guncad']['firearm_platform'])
    firearm_part = ','.join(item['value']['guncad']['firearm_part'])
    firearm_caliber = ','.join(item['value']['guncad']['firearm_caliber'])
    fabrication_method = ','.join(item['value']['guncad']['fabrication_method'])
    fabrication_tools = ','.join(item['value']['guncad']['fabrication_tools'])
    original_claim_id = item['value']['guncad']['original_claim_id']

    if original_claim_id:
        claim_id = original_claim_id

    cur = con.cursor()
    cur.execute(
        INSERT INTO guncad 
            (claim_id, name, title, guncad_category, firearm_type, firearm_platform, 
            firearm_part, firearm_caliber, fabrication_method, fabrication_tools)
        VALUES
            ("{0}","{1}","{2}","{3}","{4}","{5}","{6}","{7}","{8}","{9}")
        .format(
            claim_id,
            name,
            title,
            guncad_category,
            firearm_type,
            firearm_platform,
            firearm_part,
            firearm_caliber,
            fabrication_method,
            fabrication_tools,
        )
    )

    with open('posts/{}.txt'.format(name), 'w') as f:
        f.write('---\n')  
        f.write('title: "{}"\n'.format(title))  
        f.write('claim_id: "{}"\n'.format(claim_id))
        f.write('name: "{}"\n'.format(name))
        f.write('guncad_category: "{}"\n'.format(guncad_category))
        f.write('firearm_type: "{}"\n'.format(firearm_type))
        f.write('firearm_platform: "{}"\n'.format(firearm_platform))
        f.write('firearm_part: "{}"\n'.format(firearm_part))
        f.write('firearm_caliber: "{}"\n'.format(firearm_caliber))
        f.write('fabrication_method: "{}"\n'.format(fabrication_method))
        f.write('fabrication_tools: "{}"\n'.format(fabrication_tools))
        f.write('---\n')  
"""

con.commit()
con.close()

