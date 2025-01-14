/*const subpanel = document.getElementById("recent-items").getElementsByClassName("gunmap-subpanel")[0];
const subpanel_width = subpanel.getBoundingClientRect();
console.log(window.innerWidth);
console.log(subpanel_width.width);
console.log((window.innerWidth * .9) / subpanel_width.width);*/

document.addEventListener("DOMContentLoaded", function() {
  //Menu click handler
  document.getElementById("menu_button").addEventListener("click", function(e) { 
    document.getElementById("footer").classList.toggle("hidden");
  });

  //Results click handler
  const results_button = document.getElementById("results_button");
  if(results_button) {
    results_button.addEventListener("click", function(e) { 
      document.getElementById("results-panel").classList.toggle("hidden");
    });
  }

  //Filter click handler
  const filter_button = document.getElementById("filter_button");
  if(filter_button) {
    filter_button.addEventListener("click", function(e) { 
      document.getElementById("filter-panel").classList.toggle("hidden");
    });
  }

  const frontpageSearchButton = document.getElementById("frontpage_search");
  console.log(frontpageSearchButton);
  if(frontpageSearchButton) {
    frontpageSearchButton.addEventListener("click", function(e) { 
      const searchVal = document.getElementById("frontpage_search_text").value;
      window.location = '/entities/?q=' + searchVal;
    });
  }

  /*
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
  */
});
