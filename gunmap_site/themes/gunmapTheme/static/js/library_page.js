const metadata = [
  {
    'title': 'Main Category',
    'singular': 'gunmap_category',
    'plural': 'gunmap_categories'
  },
  {
    'title': 'Munition Type',
    'singular': 'munition_type',
    'plural': 'munition_types'
  },
  {
    'title': 'Munition Platform',
    'singular': 'munition_platform',
    'plural': 'munition_platforms'
  },
  {
    'title': 'Munition Part',
    'singular': 'munition_part',
    'plural': 'munition_parts'
  },
  {
    'title': 'Munition Caliber',
    'singular': 'munition_caliber',
    'plural': 'munition_calibers'
  },
  {
    'title': 'Fabrication Method',
    'singular': 'fabrication_method',
    'plural': 'fabrication_methods'
  },
  {
    'title': 'DIY Level',
    'singular': 'diy_level',
    'plural': 'diy_levels'
  },
  {
    'title': 'Entity Format',
    'singular': 'entity_format',
    'plural': 'entity_formats'
  }
];

let pageSize = 36;

(async function() {
  const sqlPromise = initSqlJs({
    locateFile: filename => '/js/sql-wasm.wasm'
  });

  const dataPromise = fetch("/gunmap.db").then(res => res.arrayBuffer());
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
  const db = new SQL.Database(new Uint8Array(buf));

  const urlParams = new URLSearchParams(window.location.search);
  let page = 1;

  if(urlParams.get('q')) {
    $('#filter_search input').val(urlParams.get('q'));
  }

  if(urlParams.get('page')) {
    page = parseInt(urlParams.get('page'));
  }

  if(urlParams.get('size')) {
    pageSize = parseInt(urlParams.get('size'));
  }

  if(urlParams.get('order')) {
    const order_by_val = urlParams.get('order').replace('_', ' ');

    $('div#order_wrapper select#orderby option').prop('selected', false);
    $(`div#order_wrapper select#orderby option[value="${order_by_val}"]`).prop('selected', true);
  }

  //GET UNIQUE VALUES FOR CHECKBOXES
  metadata.forEach(function(md) {
    createFilterCategory(db, md.title, md.singular, md.plural);
    if(urlParams.get(md.singular)) {
      const selectedParams = urlParams.get(md.singular).split(',');
      selectedParams.forEach(function(sp) {
        $(`div.narrowing_filter[data-id="${md.singular}"`).addClass('selected');
        $(`div.narrowing_filter[data-id="${md.singular}"`).find(`input[type="checkbox"][data-id="${sp}"]`).prop('checked', true);
      });
    }
  });

  //INITIAL POPULATION
  searchFilterHandler(db, pageSize, page);

  //SEARCH HANDLER
  $('input#search_button').click(function() {
    //searchFilterHandler(db, pageSize, page);
    console.log('here');
    const url = getViewUrl();
    window.location.href = url;
  });

  //ORDER BY HANDLER
  $('div#order_wrapper select#orderby').change(function() {
    const url = getViewUrl(true);
    window.location.href = url;
  });

  //FILTER HANDLER
  $('div#filter_wrapper div.filter_category button.apply_button').click(function() {
    //searchFilterHandler(db, pageSize, page);
    const url = getViewUrl();
    window.location.href = url;
  });

  //CLEAR BUTTON (individual filter)
  $('div#filter_wrapper div.filter_category button.clear_button').click(function() {
    $(this).parent('fieldset').find('input[type="checkbox"]').prop('checked', false);
    //searchFilterHandler(db, pageSize, page);
    const url = getViewUrl();
    window.location.href = url;
  });

  //CLEAR ALL BUTTON
  $('input#clear_all_button').click(function() {
    /*$('div#filter_wrapper fieldset input[type="checkbox"]').prop('checked', false);
    $('div#search_wrapper input#search').val('');
    $('div#order_wrapper select#orderby option').prop('selected', false);
    $(`div#order_wrapper select#orderby option#orderby_created_desc`).prop('selected', true);*/
    //searchFilterHandler(db, pageSize, page);
    //const url = getViewUrl();
    window.location.href = '/entities/';
  });

  //Handle minimizing the narrowing filters
  var allButtons = document.querySelectorAll('div[class^=narrowing_filter_title');

  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', function() {
      //const parent = this.parentElement.parentElement;
      const parent = this.parentElement;
      parent.classList.toggle("minimized");
    });
  }

  //Handle the filter search
  var allNarrowFilterInput = document.querySelectorAll('input[class^=narrow_filter_search');

  for (var i = 0; i < allNarrowFilterInput.length; i++) {
    allNarrowFilterInput[i].addEventListener('keyup', function() {
      const searchValue = this.value.trim().toLowerCase();
      const parent = this.parentElement.parentElement.parentElement.parentElement;
      const allFilterValues = parent.querySelectorAll('label');

      for (var j = 0; j < allFilterValues.length; j++) {
        const text = allFilterValues[j].textContent.toLowerCase();
        if(searchValue == "" || text.includes(searchValue)) {
          allFilterValues[j].parentElement.classList.remove('hidden');
        }
        else {
          allFilterValues[j].parentElement.classList.add('hidden');
        }
      }
    });
  }

  $('div#search_wrapper button#share_url_button').click(function() {
    shareViewHandler();
  });
})();

const createFilterCategory = function(db, title, singular, plural) {
  const values = db.exec(`SELECT * FROM ${plural}`);

  if(values.length <= 0) {
    console.log(singular);
    return
  }

  $('div#filter_narrows').append(`<div class="narrowing_filter" data-id="${singular}" id="narrowing_filter_${singular}"></div>`);
  $("div#narrowing_filter_" + singular).append(`
    <div class="narrowing_filter_title">
      <span>${title}</span>
      <button class="minimize-button"></button>
    </div>
  `);

  $("div#narrowing_filter_" + singular).append(`
    <div class="narrowing_filter_content">
      <div class="gunmap-panel-list-wrapper">
        <div class="gunmap-panel-list-wrapper-2">
          <div class="gunmap-panel-list flex-column">
            <div class="gunmap-panel-list-item flex-column">
            </div>
          </div>
        </div>
      </div>
      <div class="narrowing_filter_search gunmap-panel-input-wrapper text">
        <div class="gunmap-panel-input-wrapper-2">
          <div class="gunmap-panel-input-wrapper-3 flex-row">
            <div class="gunmap-panel-input-wrapper-pre">
              &gt;
            </div>
            <input class="narrow_filter_search" type="text">
          </div>
        </div>
      </div>
    </div>
  `);

  values[0].values.forEach(function(v) {
    $("div#narrowing_filter_" + singular + " .gunmap-panel-list-item").append(`
      <span id="${singular}_${v[0]}_filter_checkbox_wrapper" class="narrowing_filter_option">
        <input type="checkbox" data-column="${singular}" type="checkbox" data-name="${v[1]}" data-id="${v[0]}" id="${v[0]}_${v[1]}">
        <label for="${v[0]}_${v[1]}">${v[1]}</label>
      </span>
    `);
  });

  /*$('div#filter_wrapper').append(`<div class="filter_category" id="${singular}_wrapper"></div>`);
  $(`div#${singular}_wrapper`).append(`<h3>${title}</h3>`);
  $(`div#${singular}_wrapper`).append(`<fieldset id="${singular}"></fieldset>`);

  values[0].values.forEach(function(v) {
    $(`fieldset#${singular}`).append(
      `<span class="filter_checkbox_wrapper" id="${singular}_${v[0]}_filter_checkbox_wrapper">
        <input class="filter_checkbox" data-column="${singular}" type="checkbox" data-name="${v[1]}" data-id="${v[0]}">
          <label>${v[1]}</label>
        </input>
      </span>
      `
    );
  });

  $(`fieldset#${singular}`).append("<button class='apply_button'>Apply</button>");
  $(`fieldset#${singular}`).append("<button class='clear_button'>Clear</button>");*/
}

const searchFilterHandler = function(db, pageSize, page) {
  const search_text = $('#filter_search input').val();
  const order_by = $('div#order_wrapper select#orderby').find(':selected').val();

  let filter_values = {};
  let query_joins = []

  let query = 'SELECT DISTINCT e.id, e.slug, e.title, e.created, e.thumbnail_url';

  $('#filter_narrows div.narrowing_filter').each(function() {

    const filter_key = $(this).attr('data-id');
    let filter_category_values = [];

    query += `, entity_${filter_key}.${filter_key}_id`;
    query_joins.push(` LEFT JOIN entity_${filter_key} ON e.id = entity_${filter_key}.entity_id`);

    $(this).find('input[type="checkbox"]').each(function() {
      if($(this).is(':checked')) {
        filter_category_values.push($(this).attr('data-id'));
      }
    });

    if(filter_category_values.length > 0) {
      filter_values[filter_key] = filter_category_values;
    }
  });

  let query_filters = []

  Object.keys(filter_values).forEach(function(key) {
    query_filters.push(`${key}_id IN (${filter_values[key].join(",")})`);
  });

  query += ' FROM entities e';

  if(query_joins.length > 0) {
    query += query_joins.join(' ');
  }

  if(search_text) {
    query_filters.push(`title LIKE '%${search_text}%'`);
  }

  if(query_filters.length > 0) {
    query += ` WHERE ${query_filters.join(' AND ')}`;
  }

  query += ` ORDER BY ${order_by}`;

  console.log(query);

  const filter_result = db.exec(query); 

  populateLibraryPage(formatResponse(filter_result), pageSize, page);

  $('a.pagerValue').click(function(e) {
    e.preventDefault();
    //searchFilterHandler(db, pageSize, parseInt($(this).attr('data-value')));
    const url = getViewUrl(true, parseInt($(this).attr('data-value')));
    window.location.href = url;
  });
}

const formatResponse = function(res) {
  if(res.length <= 0) {
    return null;
  }

  let rawRows = res[0]['values'];
  let idColumn = -1;

  const columnNames = res[0].columns;
  for(x = 0; x < columnNames.length; x++) {
    if(columnNames[x] == 'id') {
      idColumn = x;
      break;
    }
  }

  if(idColumn < 0) {
    throw new Error('COULD NOT FIND ID COLUMN');
  }

  let posted = new Set();
  let formattedRes = [];

  for(x = 0; x < rawRows.length; x++) {
    if(posted.has(rawRows[x][idColumn])) {
      rawRows.splice(x, 1);
      x--;
    }
    else {
      posted.add(rawRows[x][idColumn]);
    }
  }

  
  res[0].values.forEach(function(row) {
    let formattedRow = {};

    for(let y = 0; y < row.length; y++) {
      formattedRow[columnNames[y]] = row[y];
    }    

    formattedRes.push(formattedRow);
  });
  
  return formattedRes;
}

const getViewUrl = function(applyPage, pageTarget) {
  const path = window.location.href.split('?')[0]

  const params = []

  const search_text = $('#filter_search input').val();
  if(search_text) {
    params.push(`q=${search_text}`);
  }

  $('div.narrowing_filter').each(function() {
    const filter_key = $(this).attr('data-id');
    let filter_category_values = [];

    $(this).find('input[type="checkbox"]').each(function() {
      if($(this).is(':checked')) {
        filter_category_values.push($(this).attr('data-id'));
      }
    });

    if(filter_category_values.length > 0) {
      params.push(`${filter_key}=${filter_category_values.join(',')}`);
    }
  });

  const currentPage = pageTarget ? pageTarget : $('div#pager div#currentPage a').attr('data-value');
  if(applyPage && currentPage != 1) {
    params.push(`page=${currentPage}`);
  }

  const orderby = $(`div#order_wrapper select#orderby`).find(':selected').val();
  if(orderby != 'cereated_desc') {
    params.push(`order=${orderby}`);
  }

  shareUrl = path;
  if(params.length > 0) {
    shareUrl += '?' + params.join('&');
  }

  return shareUrl;
}

const shareViewHandler = function() {
  shareUrl = getViewUrl();

  if(window.navigator.clipboard) {
    window.navigator.clipboard.writeText(shareUrl);
  }

  alert(`Copied ${shareUrl} to clipboard`);
}

const populateLibraryPage = function(entities, pageSize, page) {
  const start = (page - 1) * pageSize;
  console.log(typeof(page))
  let end = page * pageSize;

  let posted = new Set();
  let populatedMetadata = {}

  metadata.forEach(function(md) {
    populatedMetadata[md.singular] = {};
  });

  const entityList = $('div#results-panel .gunmap-panel-body');
  entityList.html('');

  if(!entities) {
    return;
  }

  for(let x = 0; x < entities.length; x++) {
    const entity = entities[x];

    metadata.forEach(function(md) {
      if(entity[`${md.singular}_id`] in populatedMetadata[md.singular]) {
        populatedMetadata[md.singular][entity[`${md.singular}_id`]] += 1;
      }
      else {
        populatedMetadata[md.singular][entity[`${md.singular}_id`]] = 0;
      }
    });

    if(posted.has(entity.id)) {
      continue;
    }

    if(x < start || x >= end) {
      continue;
    }

    thumbnail_url = entity.thumbnail_url
    if(!thumbnail_url) {
      //TODO: update this to something local
      thumbnail_url = 'https://t3.ftcdn.net/jpg/03/35/13/14/240_F_335131435_DrHIQjlOKlu3GCXtpFkIG1v0cGgM9vJC.jpg'
    }

    const maxTitleSize = 32 
    let title = entity.title
    if(title.length > maxTitleSize) {
      title = title.slice(0, maxTitleSize-3) + "..."
    }

    entityList.append(
      `
        <a id="entity_${entity.id}" data-slug="${entity.id}" href="/entities/${entity.slug}">
          <div class="gunmap-subpanel">
            <div class="gunmap-subpanel-title noise">${title}</div>
            <div class="gunmap-thumbnail" style="background-image: url('${thumbnail_url}');"></div>
          </div>
        </a>
      `
    );

    posted.add(entity.id);
  }
  
  $('#filter_narrows div.narrowing_filter').each(function() {

    const filter_key = $(this).attr('data-id');
    $(this).find('input[type="checkbox"]').each(function() {
      const filter_value = $(this).attr('data-id');
      if(!(parseInt(filter_value) in populatedMetadata[filter_key]) && !$(this).is(':checked')) {
        $(this).parent('span.narrowing_filter_option').addClass('hidden');
      }
      else {
        $(this).parent('span.narrowing_filter_option').removeClass('hidden');
      }
    });

    if($(this).find('span.narrowing_filter_option:not(.hidden)').length == 0) {
      $(this).addClass('hidden');
    }
  });

  const pageCount = Math.ceil(entities.length / pageSize);

  /*$('div#pager').html('');

  $('div#pager').append(
    `<div id="pageFirst">
      <a data-value="1" class="pagerValue" href="">
        <<
      </a>
    </div>`
  );

  $('div#pager').append(
    `<div id="pageLast">
      <a data-value="${page > 1 ? page - 1 : 1}" class="pagerValue" href="">
        <
      </a>
    </div>`
  );

  if(page == pageCount && page - 4 >= 1) {
    $('div#pager').append(
      `<div id="page4Prev">
        <a data-value="${page-4}" class="pageNum pagerValue" href="">
          ${page-4}  
        </a>
      </div>`
    ); 
  }

  if(page >= pageCount - 1 && page - 3 >= 1) {
    $('div#pager').append(
      `<div id="page3Prev">
        <a data-value="${page-3}" class="pageNum pagerValue" href="">
          ${page-3}  
        </a>
      </div>`
    ); 
  }

  if(page - 2 >= 1) {
    $('div#pager').append(
      `<div id="page2Prev">
        <a data-value="${page-2}" class="pageNum pagerValue" href="">
          ${page-2}  
        </a>
      </div>`
    ); 
  }

  if(page - 1 >= 1) {
    $('div#pager').append(
      `<div id="page1Prev">
        <a data-value="${page-1}" class="pageNum pagerValue" href="">
          ${page-1}  
        </a>
      </div>`
    ); 
  }

  $('div#pager').append(
    `<div id="currentPage">
      <a data-value="${page}" class="pageNum pagerValue" href="">
        <b><u>${page}</u></b>
      </a>
    </div>`
  );

  if(page + 1 <= pageCount) {
    $('div#pager').append(
      `<div id="page1Next">
        <a data-value="${page+1}" class="pageNum pagerValue" href="">
          ${page+1}  
        </a>
      </div>`
    ); 
  }

  if(page + 2 <= pageCount) {
    $('div#pager').append(
      `<div id="page2Next">
        <a data-value="${page+2}" class="pageNum pagerValue" href="">
          ${page+2}  
        </a>
      </div>`
    ); 
  } 

  if(page - 1 <= 1 && page + 3 <= pageCount) {
    $('div#pager').append(
      `<div id="page3Next">
        <a data-value="${page+3}" class="pageNum pagerValue" href="">
          ${page+3}  
        </a>
      </div>`
    ); 
  }

  if(page == 1 && page + 4 <= pageCount) {
    $('div#pager').append(
      `<div id="page4Next">
        <a data-value="${page+4}" class="pageNum pagerValue" href="">
          ${page+4}  
        </a>
      </div>`
    ); 
  }

  $('div#pager').append(
    `<div id="pageNext">
      <a data-value="${page < pageCount ? page + 1 : pageCount}" class="pagerValue" href="">
        >
      </a>
    </div>`
  );

  $('div#pager').append(
    `<div id="pageFinal">
      <a data-value="${pageCount}" class="pagerValue" href="">
        >>
      </a>
    </div>`
  ); */
}
