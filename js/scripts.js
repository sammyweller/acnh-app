

let villagerRepository = (function () {
  let villagerList = [];
  let apiUrl = 'https://acnhapi.com/v1/villagers/';

  function add(villager) {
    villagerList.push(villager);
  } //creates next item

  function getAll() {
    return villagerList;
  } //returns all items


  //create buttons that link to each villager:
  function addListItem(villager) {
    let villagers = document.querySelector('.villager-list');
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    button.innerText = villager.name;
    button.classList.add('villagerButton');

    // Append the icon and button elements to the list item
    listItem.appendChild(button);
    villagers.appendChild(listItem);

    button.addEventListener('click', function (event) { //will be used for modal
      showDetails(villager);
      console.log(event);
    });
  }

  let modal = null; // Declare a variable to store the modal element (to disable background scrolling)

  function showDetails(villager) { // Open modal when button is clicked
    console.log(villager);
    if (modal) {
      modal.remove(); // Close the existing modal if it's open
    }

    // Creates modal element
    modal = document.createElement('div');
    modal.classList.add('modal');

    // Creates modal content
    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.alignItems = 'center';
    modalContent.style.justifyContent = 'center';


    // Add the villager details to the modal content
    let nameElement = document.createElement('h2');
    nameElement.innerText = villager.name;
    modalContent.appendChild(nameElement);

    let imageElement = document.createElement('img');
    imageElement.src = villager.imageUrl;
    modalContent.appendChild(imageElement);

    let personalityElement = document.createElement('p');
    personalityElement.innerText = "Personality: " + villager.personality;
    modalContent.appendChild(personalityElement);

    let speciesElement = document.createElement('p');
    speciesElement.innerText = "Species: " + villager.species;
    modalContent.appendChild(speciesElement);

    let catchphraseElement = document.createElement('p');
    catchphraseElement.innerText = "Catchphrase: '" + capitalizeFirstLetter(villager.catchphrase) + "'";
    modalContent.appendChild(catchphraseElement);

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Create "X" close button for modal:
    let closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerText = 'Close';

    closeButton.addEventListener('click', closeModal); // Close the modal when the close button is clicked

    modalContent.appendChild(closeButton);


    // Add the modal content to the modal element
    modal.appendChild(modalContent);

    // Append the modal to the document body
    document.body.appendChild(modal);
    document.body.classList.add('modal-open'); // Class to disable scrolling when modal is open

    // Close the modal when clicked outside the modal content or by pressing Escape key
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Listen for the Escape key press event
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

  }


  function closeModal() {
    if (modal) {
      modal.remove();
      modal = null; // Reset the modal variable
      document.body.classList.remove('modal-open'); // Remove the class to enable scrolling
    }
  }


  function fetchVillager(id) {
    let url = apiUrl + id + '/';
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        let villager = {
          name: data.name['name-USen'] || 'N/A',
          imageUrl: data.image_uri || 'N/A',
          personality: data.personality,
          species: data.species,
          catchphrase: data['catch-translations']['catch-USen'] || 'N/A',
        };
        add(villager);
        return villager;
      })
      .catch(function (e) {
        console.error(e);
      });
  }


  function loadList() {
    // Display loading message
    const loadingModal = document.createElement('div');
    loadingModal.classList.add('modal');

    const loadingContent = document.createElement('div');
    loadingContent.classList.add('modal-content');

    const loadingText = document.createElement('p');
    loadingText.innerText = 'Fetching villagers...';

    loadingContent.appendChild(loadingText);
    loadingModal.appendChild(loadingContent);
    document.body.appendChild(loadingModal);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          fetch('https://acnhapi.com/v1/villagers/')
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              // Remove loading message
              loadingModal.remove();

              let villagerIds = Object.keys(data).slice(0, 390);
              let fetchPromises = villagerIds.map(function (id) {
                return fetchVillager(id);
              });
              return Promise.all(fetchPromises);
            })
            .catch(function (e) {
              console.error(e);
              // Remove loading message in case of an error
              loadingModal.remove();
            })
        );
      }, 2000); // Delay of 2 seconds (2000 milliseconds)
    });
  }


  function searchVillagers() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let filteredVillagers = villagerRepository.getAll().filter(function (villager) {
      return villager.name.toLowerCase().includes(input);
    });

    // Clear the current list
    let villagersList = document.querySelector('.villager-list');
    villagersList.innerHTML = '';

    // Add the filtered villagers to the list
    filteredVillagers.forEach(function (villager) {
      villagerRepository.addListItem(villager);
    });
  }


  // Add an event listener to trigger the search on input change
  document.getElementById('searchInput').addEventListener('input', searchVillagers);


  return {
    add: add,
    getAll: getAll,
    addListItem: addListItem,
    loadList: loadList,
  };
})();  //--> calling the function


villagerRepository.loadList().then(function (villagers) {
  villagers.forEach(function (villager) {
    villagerRepository.addListItem(villager);
  });
});


