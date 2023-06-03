document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('websites', function(result) {
    let websites = result.websites || [];

    if (websites.length === 0) {
      fetch('database.json')
        .then(response => response.json())
        .then(data => {
          websites = data;
          chrome.storage.local.set({ websites });
          populateDropdown(websites);
          handleWebsiteExistence(websites);
          restoreSelectedOption();
        })
        .catch(error => console.error(error));
    } else {
      populateDropdown(websites);
      handleWebsiteExistence(websites);
      restoreSelectedOption();
    }
  });

  function populateDropdown(websites) {
    const websiteList = document.getElementById('websiteList');
    websiteList.innerHTML = '';

    websites.forEach(function(website) {
      const option = document.createElement('option');
      option.text = website.description;
      option.value = website.url;
      websiteList.add(option);
    });
  }

  function handleWebsiteExistence(websites) {
    const addWebsiteButton = document.getElementById('addWebsiteButton');
    const newDescriptionInput = document.getElementById('newDescriptionInput');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const isWebsiteExists = websites.some(function(website) {
        return website.url === currentTab.url;
      });

      if (isWebsiteExists) {
        newDescriptionInput.disabled = true;
        addWebsiteButton.disabled = true;
      } else {
        newDescriptionInput.disabled = false;
        addWebsiteButton.disabled = false;
      }
    });
  }

  function restoreSelectedOption() {
    chrome.storage.local.get('selectedOption', function(result) {
      const selectedOption = result.selectedOption;
      if (selectedOption !== undefined) {
        const websiteList = document.getElementById('websiteList');
        websiteList.selectedIndex = selectedOption;
      }
    });
  }

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function() {
    const searchValue = searchInput.value.toLowerCase();
    const options = document.getElementById('websiteList').options;

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.text.toLowerCase().includes(searchValue)) {
        option.style.display = '';
      } else {
        option.style.display = 'none';
      }
    }
  });

  const websiteList = document.getElementById('websiteList');
  websiteList.addEventListener('change', function() {
    const selectedOption = websiteList.options[websiteList.selectedIndex];
    const url = selectedOption.value;
    if (url) {
      chrome.tabs.create({ url });
      const selectedIndex = websiteList.selectedIndex;
      chrome.storage.local.set({ selectedOption: selectedIndex });
    }
  });

const addWebsiteButton = document.getElementById('addWebsiteButton');
addWebsiteButton.addEventListener('click', function() {
  const newDescriptionInput = document.getElementById('newDescriptionInput');
  const newDescription = newDescriptionInput.value.trim();
  if (newDescription) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const newWebsite = {
        description: newDescription,
        url: currentTab.url
      };

      chrome.storage.local.get('websites', function(result) {
        const websites = result.websites || [];
        websites.push(newWebsite);
        chrome.storage.local.set({ websites }, function() {
          populateDropdown(websites);
          handleWebsiteExistence(websites);
          newDescriptionInput.value = '';
          const websiteList = document.getElementById('websiteList');
          websiteList.selectedIndex = websiteList.options.length - 1;
          const selectedIndex = websiteList.selectedIndex;
          chrome.storage.local.set({ selectedOption: selectedIndex });
        });
      });
    });
  }
});

const deleteWebsiteButton = document.getElementById('deleteWebsiteButton');
deleteWebsiteButton.addEventListener('click', function() {
  const websiteList = document.getElementById('websiteList');
  const selectedOption = websiteList.options[websiteList.selectedIndex];
  const url = selectedOption.value;
  if (url) {
    chrome.storage.local.get('websites', function(result) {
      let websites = result.websites || [];
      const updatedWebsites = websites.filter(function(website) {
        return website.url !== url;
      });

      chrome.storage.local.set({ websites: updatedWebsites }, function() {
        populateDropdown(updatedWebsites); 
        handleWebsiteExistence(updatedWebsites);
        restoreSelectedOption(); 
      });

      fetch('database.json')
        .then(response => response.json())
        .then(data => {
          const updatedData = data.filter(function(website) {
            return website.url !== url;
          });

          return fetch('database.json', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
          });
        })
        .catch(error => console.error(error));
    });
  }
});

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const capturedUrlInput = document.getElementById('capturedUrlInput');
    capturedUrlInput.value = currentTab.url;    
    chrome.storage.local.get('websites', function(result) {
      const websites = result.websites || [];
      handleWebsiteExistence(websites);
      restoreSelectedOption();
    });
  });
});
