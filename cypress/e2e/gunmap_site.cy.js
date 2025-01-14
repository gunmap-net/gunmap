describe('Basic Opening Functionality', () => {
  it('Opens the Gunmap website', () => {
    cy.visit('http://localhost:1313')
  })

  it('Opens the entity list', () => {
    cy.visit('http://localhost:1313/entities/')
  })

  it('Ensures that the entity list shows thumbnails', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#entity_list div.entity img.thumbnail').should('have.attr', 'src', 'https://player.odycdn.com/v6/streams/53bdef0a790021cc6f44be58f2d63f0bd763584b/b18371.mp4')

  })

  it('Ensures that we show empty thumbnail if the item doesn\'t otherwise have one', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#entity_list div#entity_9 img.thumbnail').should('have.attr', 'src', 'https://t3.ftcdn.net/jpg/03/35/13/14/240_F_335131435_DrHIQjlOKlu3GCXtpFkIG1v0cGgM9vJC.jpg')

  })

  it('Opens an entity', () => {
    cy.visit('http://localhost:1313/entities/liberator')
  })
})

describe('Library Page Functionality', () => {
  it('Ensures that we can combine the search and the filters', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Documents"]').click();
    cy.get('#search_wrapper input#search').type('Lib')
    cy.get('#search_wrapper button#share_url_button').click()
    cy.on('window:alert', (str) => {
      expect(str).to.equal(`Copied http://localhost:1313/entities/?q=Lib&gunmap_category=1,2 to clipboard`)
    })
  })

  it('Ensures that by default we show all entities', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('div.entity').should('have.length', 10)
  })

  it('Ensures we have a search box', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('input#search')
  })

  it('Ensures we have a checkbox group for gunmap category', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('fieldset#gunmap_category')
  })

  it('Ensures we have multiple checkbox groups', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div.filter_category').should('have.length', 3)
  })

  it('Ensures that the gunmap_category checkbox group has checkboxes', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('fieldset#gunmap_category input[type="checkbox"]').should('have.length', 7)
    cy.get('fieldset#gunmap_category input[type="checkbox"][data-name="Printable Firearms"]')
  })

  it('Ensures we have an order by box', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('select#orderby')
  })

  it('Ensures we order by created desc by default', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div.entity').first().find('h3').should('have.text', 'G0 Cutcode')
  })

  it('Ensures we can order by created asc using url params', () => {
    cy.visit('http://localhost:1313/entities/?order=created_asc')
    cy.get('div.entity').first().find('h3').should('have.text', 'Luger Reference Model')
  })

  it('Ensures we can order by title asc using url params', () => {
    cy.visit('http://localhost:1313/entities/?order=title_asc')
    cy.get('div.entity').first().find('h3').should('have.text', 'DD17.2 Printable Glock')
  })

  it('Ensures we can order by title desc using url params', () => {
    cy.visit('http://localhost:1313/entities/?order=title_desc')
    cy.get('div.entity').first().find('h3').should('have.text', 'Practical Scrap Metal Arms #1: Building the Luty')
  })

  it('Ensures that we can narrow by search', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#search_wrapper input#search').type('Lib')
    cy.get('#search_wrapper button#search_button').click()
    cy.get('div.entity').should('have.length', 1)
    cy.get('div.entity').find('h3').should('have.text', 'Liberator')
  })

  it('Ensures that we can narrow by a checkbox', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('div.entity').should('have.length', 3)
    cy.get('div.entity').first().find('h3').should('have.text', 'King Cobra 9')
  })

  it('Ensures that we can uncheck a checkbox to restore the full list', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('div.entity').should('have.length', 10)
  })

  it('Ensures that we can check two checkboxes (in the same category) to get multiple results', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Documents"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('div.entity').should('have.length', 6)
  })

  it('Ensures that we can check two checkboxes (in different categories) to get multiple results', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #munition_type_wrapper input[data-name="Pistol"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('div.entity').should('have.length', 2)
  })

  it('Ensures that the checkboxes self-narrow depending on the result (checkbox)', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('#filter_wrapper #munition_type_wrapper input[type="checkbox"]:visible').should('have.length', 2)
  })

  it('Ensures that the checkboxes self-narrow depending on the result (search)', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#search_wrapper input#search').type('Lu')
    cy.get('#search_wrapper button#search_button').click()
    cy.get('#filter_wrapper #munition_platform_wrapper input[type="checkbox"]:visible').should('have.length', 3)
  })

  it('Ensures that we can combine the search and the filters', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Documents"]').click();
    cy.get('#search_wrapper input#search').type('Lib')
    cy.get('#search_wrapper button#search_button').click()
    cy.get('div.entity').should('have.length', 1)
    cy.get('div.entity').find('h3').should('have.text', 'Liberator')
  })

  it('Ensures that we get no results when we combine filters to return nothing', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Documents"]').click();
    cy.get('#search_wrapper input#search').type('Lib')
    cy.get('#search_wrapper button#search_button').click()
    cy.get('div.entity').should('have.length', 0)
  })

  it('Ensures that we can clear a checkbox', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.clear_button').click();
    cy.get('div.entity').should('have.length', 10)
  })

  it('Ensures that we can clear a checkbox (more interesting)', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #munition_type_wrapper input[data-name="Pistol"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.apply_button').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper button.clear_button').click();
    cy.get('div.entity').should('have.length', 7)
  })

  it('Ensures that we can clear all', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Printable Firearms"]').click();
    cy.get('#filter_wrapper #gunmap_category_wrapper input[data-name="Documents"]').click();
    cy.get('#search_wrapper input#search').type('Lib')
    cy.get('#search_wrapper button#search_button').click()
    cy.get('#search_wrapper button#clear_all_button').click()
    cy.get('div.entity').should('have.length', 10)
  })

  it('Ensures that we can narrow by search using url params', () => {
    cy.visit('http://localhost:1313/entities/?q=Lib')
    cy.get('div.entity').should('have.length', 1)
    cy.get('div.entity').find('h3').should('have.text', 'Liberator')
  })

  it('Ensures that we can narrow by a checkbox using url params', () => {
    cy.visit('http://localhost:1313/entities/?gunmap_category=1')
    cy.get('div.entity').should('have.length', 3)
    cy.get('div.entity').first().find('h3').should('have.text', 'King Cobra 9')
  })

  it('Ensures that narrow by two checkboxes (same category) using url params', () => {
    cy.visit('http://localhost:1313/entities/?gunmap_category=1,2&size=10')
    cy.get('div.entity').should('have.length', 6)
  })

  it('Ensures that narrow by two checkboxes (different category) using url params', () => {
    cy.visit('http://localhost:1313/entities/?gunmap_category=1&munition_type=1')
    cy.get('div.entity').should('have.length', 2)
  })

  it('Ensures that we can narrow by search and checkbox using url params', () => {
    cy.visit('http://localhost:1313/entities/?q=Lib&gunmap_category=1,2')
    cy.get('div.entity').should('have.length', 1)
    cy.get('div.entity').find('h3').should('have.text', 'Liberator')
  })

  it('Ensures that by default we show all entities (paged)', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div.entity').should('have.length', 3)
  })

  it('Ensures that we have a pager', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#pager')
  })

  it('Ensures that the pager has the right number of pages', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#pageFirst')
    cy.get('div#pager div#pageLast')
    cy.get('div#pager div#pageNext')
    cy.get('div#pager div#pageFinal')
  })

  it('Ensures that current page is selected properly', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#pager div#currentPage u').should('have.text', '1')
  })

  it('Ensures that current page selects properly if we load with a different page', () => {
    cy.visit('http://localhost:1313/entities/?page=3')
    cy.get('div#pager div#currentPage u').should('have.text', '3')
    cy.get('div.entity').first().find('h3').should('have.text', 'Liberator')
  })

  it('Ensures that we can manipulate the pager', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('div#pager div#currentPage u').should('have.text', '1')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#page1Next a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '2')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#page2Next a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '4')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#pageLast a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '3')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#pageFirst a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '1')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#pageNext a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '2')
    cy.get('div#pager a.pageNum').should('have.length', 4)
    cy.get('div#pager div#pageFinal a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '4')
    cy.get('div#pager a.pageNum').should('have.length', 4)
  })

  it('Ensures that we can manipulate the pager (different page size)', () => {
    cy.visit('http://localhost:1313/entities/?size=1')
    cy.get('div#pager div#currentPage u').should('have.text', '1')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#page1Next a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '2')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#page2Next a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '4')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#pageLast a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '3')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#pageFirst a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '1')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#pageNext a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '2')
    cy.get('div#pager a.pageNum').should('have.length', 5)
    cy.get('div#pager div#pageFinal a').click()
    cy.get('div#pager div#currentPage u').should('have.text', '10')
    cy.get('div#pager a.pageNum').should('have.length', 5)
  })

  it('Ensures pager handles large page sizes right', () => {
    cy.visit('http://localhost:1313/entities/?size=10')
    cy.get('div#pager a.pageNum').should('have.length', 1)
  })

  /*
  it('Ensures we have a limiting filter for created date', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('input#created_start')
  })

  it('Ensures we have a limiting filter for author', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('input#author')
  })

  it('Ensures we have a limiting filter for organization', () => {
    cy.visit('http://localhost:1313/entities/')
    cy.get('input#organization')
  })
  */
})
