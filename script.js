const headerNavbar = document.getElementById('navbarSupportedContent');
const resultBlock = document.getElementById('results');
const pages = document.querySelector('.pagination');
const searchButton = document.getElementById('search');
const searchInput = document.querySelector('.form-control');
const loader = document.querySelector('.loader');
let currentPage = 1;
const maxInfoLinesCount = 5;
const API_URL = 'https://swapi.dev/api/';
let searchMode = false;
const LocalStorageKeys = {
    category: 'category'
}
const selectedCategory = localStorage.getItem(LocalStorageKeys.category) || CATEGORIES.people;

document.addEventListener("DOMContentLoaded", () => {
    headerNavbar.querySelector(`#${selectedCategory}`).checked = true;
    getData(selectedCategory).then((data) => {
        renderCards(data, selectedCategory);
        addPagination(data.count);
    })
});


function getData(path) {
    resultBlock.innerHTML = null;
    loader.classList.remove(MODIFICATORS.hide);
    return fetch(`${API_URL}${path}`).then((res) => res.json());
}

function getSelectedCategory() {
    return [...headerNavbar.querySelectorAll('input')].find(item => item.checked).getAttribute('id');
}

pages.addEventListener('click', ({target}) => {
    const pageItem = target.closest('.page-item');
    if (!pageItem.classList.contains('.active')) {
        pages.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        pageItem.classList.add('active');
        const selectedCategory = getSelectedCategory();
        getData(`${selectedCategory}/?page=${pageItem.getAttribute('data-index')}`)
            .then((data) => renderCards(data, selectedCategory));
    }
})


resultBlock.addEventListener('click', (event) => {
    if (event.target.closest('.btn') && event.isTrusted) {
        resultBlock.querySelectorAll('.btn').forEach(item => {
            if (!item.classList.contains('collapsed')) {
                item.click();
            }
        })
    }
});

searchButton.addEventListener('click', (event) => {
    if (!searchMode) {
        currentPage = [...pages.querySelectorAll('.page-item')].find(item => item.classList.contains('active')).getAttribute('data-index');
    }
    if (searchInput.value) {
        searchMode = true;
        pages.innerHTML = null;
        const selectedCategory = getSelectedCategory();
        getData(`${selectedCategory}/?search=${searchInput.value}`).then((data) => {
            if (data.count) {
                renderCards(data, selectedCategory);
                addPagination(data.count);
            } else {
                loader.classList.add(MODIFICATORS.hide);
                resultBlock.innerHTML += '<span class="h3">Nothing Found</span>';
            }
        })
    }
})

searchInput.addEventListener('input', () => {
    if (searchMode && !searchInput.value) {
        searchMode = false;
        pages.innerHTML=null;
        const selectedCategory = getSelectedCategory();
        getData(selectedCategory).then((data => {
            renderCards(data, selectedCategory)
            addPagination(data.count);
            pages.querySelectorAll('.page-item').forEach(item => {
                if (item.getAttribute('data-index') === currentPage) {
                    item.click();
                }
            })
        }))
    }
})

function addCardLayout(title, layout, index) {
    const card = document.createElement('div');
    card.className = 'card m-2';
    card.innerHTML = `<div class="card-body">
            <p class="title">
                <span class="h5">${title}</span>
                <button class="btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#cardInfo${index}"
                        aria-expanded="false">
                    <i class="fas fa-angle-down"></i>
                </button>
            </p>
            <div class="text">
                ${layout.splice(0, maxInfoLinesCount).join('')}
            </div>
            <div class="collapse text" id="cardInfo${index}">
                ${layout.join('')}
            </div>
        </div>`;
    resultBlock.appendChild(card);
}

function renderCards({results}, category) {
    loader.classList.add(MODIFICATORS.hide);
    resultBlock.innerHTML = null;
    const lib = LIBRARIES[category];
    results.forEach((item, index) => {
        const cardLayout = Object.keys(lib).map(key => `<span class="border-bottom border-dark">${lib[key]}:</span>&nbsp;${item[key]}<br/>`);
        cardLayout.push(`<a href="${item.url}" target="_blank">Link to all info...</a>`)
        addCardLayout(item.name, cardLayout, index);
    })
}

function addPagination(value) {
    pages.innerHTML = null;
    const pagesCount = Math.ceil(value / 10);
    for (let i = 0; i < pagesCount; i++) {
        pages.innerHTML += `<li class="page-item" data-index="${i + 1}"><a class="page-link" href="#">${i + 1}</a></li>`;
    }
    if (pagesCount) {
        pages.querySelector('.page-item').classList.add('active');
    }
}

headerNavbar.addEventListener('click', ({target}) => {
    if (target.tagName === 'LABEL') {
        const category = target.textContent.toLowerCase().trim();
        localStorage.setItem(LocalStorageKeys.category, category);
        pages.innerHTML = null;
        searchMode = false;
        searchInput.value = '';
        getData(category).then((data) => {
            renderCards(data, category);
            addPagination(data.count);
        });
    }
})