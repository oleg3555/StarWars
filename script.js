const headerNavbar = document.getElementById('navbarSupportedContent');
const resultBlock = document.getElementById('results');
const pages = document.querySelector('.pagination');
const search = document.querySelector('.form-control');
const loader = document.querySelector('.loader');
let currentPage = 1;
const selectedCategory = localStorage.getItem('category') || KEYS_VARIABLES.categories.people;


function getData(path) {
    resultBlock.innerHTML = null;
    loader.classList.remove(KEYS_VARIABLES.modificators.loader_hide);
    return fetch(`https://swapi.dev/api/${path}`).then((res) => res.json());
}

function getSelectedCategory() {
    let category = null;
    headerNavbar.querySelectorAll('input').forEach(item => {
        if (item.checked) {
            category = item.getAttribute('id');
        }
    })
    return category;
}

pages.addEventListener('click', ({target}) => {
    const pageItem = target.closest('.page-item');
    if (!pageItem.classList.contains('.active')) {
        pages.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        pageItem.classList.add('active');
        const selectedCategory = getSelectedCategory();
        getData(`${selectedCategory}/?page=${pageItem.getAttribute('data-index')}`)
            .then((data) => displayResults(data, selectedCategory));
    }
})

resultBlock.addEventListener('click', (event) => {
    if (event.target.closest('.btn')) {
        $(document.querySelectorAll('.collapse')).collapse('hide');
    }
});
search.addEventListener('focus', () => {
    if (search.value === '') {
        pages.querySelectorAll('.page-item').forEach(item => {
            if (item.classList.contains('active')) {
                currentPage = item.getAttribute('data-index');
            }
        })
    }
})

search.addEventListener('input', (event) => {
    const selectedCategory = getSelectedCategory();
    getData(`${selectedCategory}/?search=${event.target.value}`).then((data) => {
        addPagination(data.count);
        if (search.value === '') {
            pages.querySelectorAll('.page-item').forEach(item => {
                if (item.getAttribute('data-index') === currentPage) {
                    item.click();
                }
            })
        } else {
            displayResults(data, selectedCategory);
        }
    });
})

function addPagination(value) {
    pages.innerHTML = null;
    const pagesCount = Math.ceil(value / 10);
    for (let i = 0; i < pagesCount; i++) {
        pages.innerHTML += `<li class="page-item" data-index="${i + 1}"><a class="page-link" href="#">${i + 1}</a></li>`;
    }
    if (value) {
        pages.querySelector('.page-item').classList.add('active');
    }
}

function addCardLayout(title, layout, index) {
    const card = document.createElement('div');
    card.className = 'card m-2';
    card.innerHTML = `<div class="card-body">
            <p class="text-center h5">${title}
                <button class="btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#cardInfo${index}"
                        aria-expanded="false">
                    <i class="fas fa-angle-down"></i>
                </button>
            </p>
            <div class="text">
                ${layout.splice(0, 5).join('')}
            </div>
            <div class="collapse text" id="cardInfo${index}">
                ${layout.join('')}
            </div>
        </div>`;
    resultBlock.appendChild(card);
}

function renderCards(data, keys, lib) {
    loader.classList.add(KEYS_VARIABLES.modificators.loader_hide);
    resultBlock.innerHTML = null;
    data.forEach((item, index) => {
        const cardLayout = keys.map(key => `<span class="border-bottom border-dark">${lib[key]}:</span>&nbsp;${item[key]}<br/>`);
        cardLayout.push(`<a href="${item.url}">More info...</a>`)
        addCardLayout(item.name, cardLayout, index);
    })
}

function displayResults({results}, value) {
    if (value === KEYS_VARIABLES.categories.planets) {
        renderCards(results, planetKeys, PLANETS_LIB);
    } else if (value === KEYS_VARIABLES.categories.people) {
        renderCards(results, peopleKeys, PEOPLE_LIB);
    } else if (value === KEYS_VARIABLES.categories.starships) {
        renderCards(results, starshipKeys, STARSHIP_LIB);
    } else if (value === KEYS_VARIABLES.categories.vehicles) {
        renderCards(results, vehicleKeys, VEHICLE_LIB);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    headerNavbar.querySelector(`#${selectedCategory}`).checked = true;
    getData(selectedCategory).then((data) => {
        displayResults(data, selectedCategory);
        addPagination(data.count);
    })
});

headerNavbar.addEventListener('click', ({target}) => {
    if (target.tagName === "LABEL") {
        const category = target.textContent.toLowerCase().trim();
        localStorage.setItem('category', category);
        search.value = '';
        getData(category).then((data) => {
            displayResults(data, category);
            addPagination(data.count);
        });
    }
})
//обработать промисы