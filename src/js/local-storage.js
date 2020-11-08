import refs from './refs.js';
import updateButtons from '../template/favorite-cities.hbs';
import addCity from '../template/oneCity.hbs';
import Siema from 'siema';
import { renderOneDayWeather } from './render/renderOneDay';
import api from './apiService';
import { changeBackgroundImage } from './components/backgroundImage';

const storage = {
  favoriteCities: [],
};

refs.locationFormInput.addEventListener('input', function () {
  if (this.value) {
    return (this.value = this.value[0].toUpperCase() + this.value.slice(1));
  }
});
createButtons(getLocalStorage());

refs.locationFormBtn.addEventListener('click', () => {
  addToLocalStorage();

  if (widthOfUserScreen < 768) {
    if (storage.favoriteCities.length > 2) {
      refs.btnNext.hidden = false;
    }
  }

  if (widthOfUserScreen > 768) {
    if (storage.favoriteCities.length > 4) {
      refs.btnNext.hidden = false;
    }
  }
});

refs.sliderList.addEventListener('click', event => {
  if (event.target.nodeName === 'BUTTON') {
    const textContent = event.path[1].childNodes[1].textContent;
    const indexForRemove = storage.favoriteCities.indexOf(textContent);

    mySiema.remove(indexForRemove);

    storage.favoriteCities.splice(indexForRemove, 1);

    localStorage.setItem('city', JSON.stringify(storage.favoriteCities));

    if (widthOfUserScreen < 768) {
      if (storage.favoriteCities.length <= 2) {
        refs.btnNext.hidden = true;
        refs.btnPrev.hidden = true;
      }
    }

    if (widthOfUserScreen > 768) {
      if (storage.favoriteCities.length <= 4) {
        refs.btnNext.hidden = true;
      }
    }
  }

  if (event.target.nodeName === 'P') {
    const location = event.target.textContent;
    refs.locationFormInput.value = location;
    // Делаем запрос и рендерим на один день
    api.getOneDayData(location).then(data => renderOneDayWeather(data));
    // Меняем картинку по городу
    changeBackgroundImage(location);
  }
});

const mySiema = new Siema({
  selector: refs.sliderList,
  perPage: {
    279: 2,
    768: 4,
    1119: 4,
  },
  duration: 200,
  draggable: false,
  multipleDrag: false,
  threshold: 20,
  loop: false,
});

refs.btnPrev.addEventListener('click', () => {
  mySiema.prev();
  if (mySiema.currentSlide === 0) {
    refs.btnPrev.hidden = true;
    
  }
});

refs.btnNext.addEventListener('click', () => {
  mySiema.next();
  if (mySiema.currentSlide > 0) {
    refs.btnPrev.hidden = false;
  }

});

if (mySiema.currentSlide === 0) {
  refs.btnPrev.hidden = true;
}


const widthOfUserScreen = window.innerWidth;

if (widthOfUserScreen < 768) {
  if (storage.favoriteCities.length <= 2) {
    refs.btnNext.hidden = true;
  }
}

if (widthOfUserScreen > 768) {
  if (storage.favoriteCities.length <= 4) {
    refs.btnNext.hidden = true;
  }
}

function clearClass() {
  refs.locationFormBtn.classList.remove('search-location__form-btn-focus');
}

function getLocalStorage() {
  const arrayOfCities = localStorage.getItem('city');

  if (!arrayOfCities) {
    return;
  }

  const parsedCities = JSON.parse(arrayOfCities);
  storage.favoriteCities = parsedCities;

  return parsedCities;
}

function createButtons(cities) {
  const markup = updateButtons(cities);

  refs.sliderList.insertAdjacentHTML('beforeend', markup);
}

function addToLocalStorage() {
  const city = refs.locationFormInput.value;

  if (!city) {
    return;
  }

  if (storage.favoriteCities.includes(city)) {
    return;
  }

  refs.locationFormBtn.classList.add('search-location__form-btn-focus');
  storage.favoriteCities.push(city);

  localStorage.setItem('city', JSON.stringify(storage.favoriteCities));
  // refs.locationFormInput.value = '';

  setTimeout(clearClass, 800);

  const addNewButton = addCity(city);
  const newElement = document.createElement('div');

  newElement.innerHTML = addNewButton;

  mySiema.append(newElement);
}
