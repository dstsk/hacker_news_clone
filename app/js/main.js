;(function () {
  'use strict'

  // * Ссылки API
  const newStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json'
  const topStoriesURL = 'https://hacker-news.firebaseio.com/v0/topstories.json'
  const newsItemURL = 'https://hacker-news.firebaseio.com/v0/item/'

  // * Кнопки
  const topBtn = document.querySelector('.top-btn')
  const newBtn = document.querySelector('.new-btn')
  const resetNewsBtn = document.querySelector('.reset-btn')
  const resetCommentsBtn = document.querySelector('.reset-comments-btn')
  const backBtn = document.querySelector('.back-btn')
  const ratingBtn = document.querySelector('.news-list__rating-btn')
  const dateBtn = document.querySelector('.news-list__date-btn')

  // * Страница со списком новостей
  const newsList = document.querySelector('.news-list__body')
  const homePage = document.querySelector('.home-page')
  const newsError = document.querySelector('.news-list__error')
  const ratingSvg = document.querySelector('.news-list__rating-svg')
  const dateSvg = document.querySelector('.news-list__date-svg')

  // * Страница новости
  const newsPage = document.querySelector('.news-page')
  const newsItem = document.querySelector('.news-page__header')
  const commentsTitle = document.querySelector('.comments__amount')
  const commentsWrapper = document.querySelector('.comments__wrapper')
  const commentsMessage = document.querySelector('.comments__message')
  const commentsError = document.querySelector('.comments__error')

  // * Прелоадеры
  const preloaderNews = document.querySelector('.preloader-news')
  const preloaderComments = document.querySelector('.preloader-comments')

  // * Переменные
  let news = []
  let newsAmount = 50
  let currentURL
  let currentNews
  let allCommentsIds = []
  let commentsAll = []
  let rootCommentsIds

  /**========================================================================
   * *                            Общие функции
   *========================================================================**/

  // * Проверка типа устройства
  const isTouchScreen = isMobile.any
  document.body.classList.add(`${isTouchScreen ? '_mobile' : '_pc'}`)

  // * Показать / Скрыть / Очистить
  const show = element => {
    element.classList.remove('hidden')
  }
  const hide = element => {
    element.classList.add('hidden')
  }
  const clear = element => {
    element.innerHTML = ''
  }
  const hidePseudoElements = el => el.classList.remove('up', 'down')

  // * Блокировка / разблокировка кнопки
  const disable = button => {
    button.disabled = true
  }
  const enable = button => {
    button.disabled = false
  }

  // * Добавление / удаление класса active
  const addActiveClass = btn => {
    btn.classList.add('active')
  }
  const removeActiveClass = btn => {
    btn.classList.remove('active')
  }

  // * Отобразить страницу с новостью
  const showNewsPage = () => {
    show(newsPage)
    hide(homePage)
    hide(resetNewsBtn)
    hide(topBtn)
    hide(newBtn)
    show(backBtn)
    show(resetCommentsBtn)
  }

  // * Получение данных с сервера
  const fetchData = url => {
    return fetch(url)
      .then(res => res.json())
      .then(data => data)
      .catch(err => err)
  }

  /**========================================================================
   * *                     Страница списка новостей
   *========================================================================**/

  // * Добавление новости в список
  const renderNews = data => {
    const html = `
      <tr class="news-list__item row" style="cursor: pointer" data-id="${
        data.id
      }">
        <td class="news-list__item-title">
        ${data.title}
        </td>
        <td class="news-list__item-rating">${data.score}</td>
        <td class="news-list__item-author">${data.by}</td>
        <td class="news-list__item-date">${new Date(data.time * 1000)
          .toLocaleString()
          .slice(0, -3)
          .replace(',', ' |')}
        </td>
      </tr>
    `
    newsList.insertAdjacentHTML('beforeend', html)
  }

  // * Обновление списка новостей
  const reloadHomePage = () => {
    disable(resetNewsBtn)
    clear(newsList)
    show(homePage)
    hide(newsPage)
    show(preloaderNews)
    init(currentURL)
  }

  // * Возвращение к списку новостей
  const toHomePage = () => {
    show(homePage)
    hide(newsPage)
    show(resetNewsBtn)
    hide(backBtn)
    hide(resetCommentsBtn)
    show(topBtn)
    show(newBtn)
  }

  // * Отрисовка списка новостей
  const renderNewsList = async url => {
    try {
      // Запоминаем текущую категорию списка новостей
      currentURL = url

      // Получаем массив с id-номерами последних новостей
      const data = await fetchData(url)
      if (data.error) {
        throw new Error(
          'Не удалось связаться с сервером, попробуйте перезагрузить страницу. 🙄'
        )
      }

      // Отбираем n самых свежих
      const lastNews = data.slice(0, newsAmount)

      // Получаем их объекты
      const promises = lastNews.map(d => {
        return fetchData(`${newsItemURL}${d}.json`)
      })
      news = await Promise.all(promises)
      if (!news) {
        throw new Error(
          'Что-то пошло не так, попробуйте перезагрузить страницу. 🙄'
        )
      }

      // Отрисовываем в списке
      for (const n of news) {
        renderNews(n)
      }
    } catch (err) {
      newsError.innerHTML = err.message
    }
  }

  // * Функция запуска приложения
  const init = async url => {
    try {
      clear(newsList)
      clear(newsError)
      disable(resetNewsBtn)
      disable(topBtn)
      disable(newBtn)
      disable(ratingBtn)
      disable(dateBtn)
      show(preloaderNews)
      removeActiveClass(topBtn)
      removeActiveClass(newBtn)
      hidePseudoElements(ratingBtn)
      hidePseudoElements(dateBtn)
      show(ratingSvg)
      show(dateSvg)

      await renderNewsList(url)

      hide(preloaderNews)
      enable(resetNewsBtn)
      enable(ratingBtn)
      enable(dateBtn)

      if (currentURL === topStoriesURL) {
        enable(newBtn)
        removeActiveClass(newBtn)
        addActiveClass(topBtn)
      }

      if (currentURL === newStoriesURL) {
        enable(topBtn)
        removeActiveClass(topBtn)
        addActiveClass(newBtn)
      }
    } catch (err) {
      newsError.innerHTML = err.message
    }
  }

  // * Функции сортировки новостей
  const sortAscending = s => {
    clear(newsList)
    let sortArr
    if (s === 'date') sortArr = news.sort((a, b) => (a.time > b.time ? -1 : 1))
    if (s === 'score')
      sortArr = news.sort((a, b) => (a.score > b.score ? -1 : 1))
    sortArr.forEach(el => renderNews(el))
  }

  const sortDescending = s => {
    clear(newsList)
    let sortArr
    if (s === 'date') sortArr = news.sort((a, b) => (a.time > b.time ? 1 : -1))
    if (s === 'score')
      sortArr = news.sort((a, b) => (a.score > b.score ? 1 : -1))
    sortArr.forEach(el => renderNews(el))
  }

  const sortingLogic = function (s) {
    if (!this.classList.contains('up') && !this.classList.contains('down')) {
      sortAscending(s)
      this.classList.add('down')
    } else if (this.classList.contains('down')) {
      sortDescending(s)
      this.classList.remove('down')
      this.classList.add('up')
    } else if (this.classList.contains('up')) {
      sortAscending(s)
      this.classList.remove('up')
      this.classList.add('down')
    }
  }

  /**========================================================================
   * *                          Страница новости
   *========================================================================**/

  // * Отрисовка хедера страницы новости
  const renderHeader = data => {
    const newsText = data.text
      ? `<div class="news__text">${data.text}</div>`
      : ''
    const html = `
      <div class="news__title">${data.title}</div>
      <div class="news__info">
        <div class="news__author">author: <span>${data.by}</span></div>
  
        <div class="news__date">
            date: <span>${new Date(data.time * 1000)
              .toLocaleString()
              .slice(0, -3)
              .replace(',', ' |')}</span>
        </div>
      </div>
      <div class="news__link">
        <a href="${data.url}" target="_blank">Перейти к источнику</a>
      </div>
      ${newsText}
      `
    newsItem.insertAdjacentHTML('afterbegin', html)
    newsItem.style.borderBottom = '1px solid #000'
  }

  // * Получение объектов комментариев
  const getComments = async commmentIds => {
    try {
      const promises = commmentIds.map(c =>
        fetchData(`${newsItemURL}${c}.json`)
      )

      if (!promises) {
        throw new Error(
          'Что-то пошло не так, попробуйте перезагрузить страницу. 🙄'
        )
      }

      return await Promise.all(promises)
    } catch (err) {
      commentsError.innerHTML = err.message
    }
  }

  // * Построение дерева комментариев в объекте (если у комментария есть вложенные комментарии,
  // * то в его объект добавляется поле children, в которое добавляется массив с объектами вложенных комментариев)
  const buildTreeOfComments = (commentsArray, parent, currentNews) => {
    parent = parent || currentNews.id
    const result = []
    commentsArray.forEach(item => {
      if (item.parent === parent) {
        result.push(item)
        item.children = buildTreeOfComments(commentsArray, item.id, currentNews)
        if (!item.children.length) {
          delete item.children
        }
      }
    })
    return result
  }

  // * Создание HTML-разметки отдельного комментария
  const renderComment = data => {
    // Подбор нужного окончания к слову 'ответ'
    let ending = ''
    if (data.kids) {
      let l = String(data.kids.length)
      if (l >= 11 && l <= 15) {
        ending = 'ов'
      } else if (l[l.length - 1] >= 2 && l[l.length - 1] < 5) {
        ending = 'а'
      } else if (
        (l[l.length - 1] >= 5 && l[l.length - 1] <= 10) ||
        l[l.length - 1] === 0
      ) {
        ending = 'ов'
      }
    }

    return `
      <div class="${data.kids ? 'comment has-child' : 'comment'}">       
        <div class="comments__item-header">
          <div class="comments__author">${data.by}</div>
          <div class="comments__time">${new Date(data.time * 1000)
            .toLocaleString()
            .slice(0, -3)
            .replace(',', ' |')}</div>
        </div>
        <div class="comments__item-body">
        ${data.text}
        </div>
        ${data.kids ? '<div class="comments__answers up"><span>' : ''}
        ${data.kids ? `${data.kids.length} ответ${ending}` : ''}
        </span></div>
      </div> 
    `
  }

  // * Создание HTML-разметки вложенных комментариев
  const createNestedComments = (obj, currentNews, ulClass = '') => {
    let ul = document.createElement('ul')
    if (ulClass) ul.classList.add(ulClass)

    if (obj) {
      obj.forEach(el => {
        let li = document.createElement('li')
        if (el.parent === currentNews.id) {
          li.classList.add('comments__item', 'comment-root')
        } else {
          li.classList.add('comments__item', 'comment-nested', 'hidden')
        }
        li.insertAdjacentHTML('beforeend', renderComment(el))
        ul.append(li)

        const ulClass = 'child-comments'

        let childrenUl = createNestedComments(el.children, currentNews, ulClass)
        if (childrenUl) {
          li.append(childrenUl)
        }
      })
    }
    return ul
  }

  // * Построение дерева комментариев в DOM
  const createTree = (container, obj, currentNews) => {
    container.append(createNestedComments(obj, currentNews))
  }

  // * Отрисовка комментариев
  const renderComments = async (commentsIds, currentNews) => {
    try {
      // Получаем массив с комментариями текущего слоя
      const comments = await getComments(commentsIds)

      if (!comments) {
        throw new Error(
          'Что-то пошло не так, попробуйте перезагрузить страницу. 🙄'
        )
      }

      // Отбираем не удалённые комментарии и добавляем их id-номера в общий массив
      const commentsIdsExceptForDeleted = comments.filter(c => c.text)
      commentsAll.push(commentsIdsExceptForDeleted)
      let commentsAllFlat = commentsAll.flat()

      // Получаем массив id-номеров следующего слоя комментариев, если он есть
      const nextCommentsIds = []
      for (const c of commentsIdsExceptForDeleted) {
        if (c.kids) {
          nextCommentsIds.push(c.kids)
        }
      }
      const nextCommentsIdsFlat = nextCommentsIds.flat()

      // Если слой пуст, строим дерево комментариев
      if (nextCommentsIdsFlat.length === 0) {
        // Выстраиваем иерархию в обхектах комментариев
        const treeOfComments = buildTreeOfComments(
          commentsAllFlat,
          undefined,
          currentNews
        )

        // Строим дерево в DOM
        createTree(commentsWrapper, treeOfComments, currentNews)

        // Убираем прелоадер, разблокируем кнопку перезагрузки
        hide(preloaderComments)
        enable(backBtn)
        enable(resetCommentsBtn)

        // Отображаем количество комментариев
        commentsTitle.innerHTML = `Комментарии (${currentNews.descendants}):`
        console.log(currentNews)
        console.log(currentNews.descendants)

        // Очищаем необходимые массивы
        commentsAll = []
        allCommentsIds = []
      }

      // Рекурсивно проходим по всем слоям комментариев
      if (nextCommentsIds.length !== 0) {
        await renderComments(nextCommentsIdsFlat, currentNews)
      }
    } catch (err) {
      commentsError.innerHTML = err.message
    }
  }

  // * Отрисовка страницы с новостью
  const renderNewsPage = async currentNewsId => {
    try {
      // disable(resetCommentsBtn)
      // Получаем объект текущей новости
      currentNews = await fetchData(`${newsItemURL}${currentNewsId}.json`)

      if (!currentNews) {
        throw new Error(
          'Что-то пошло не так, попробуйте перезагрузить страницу. 🙄'
        )
      }
      // Отрисовываем хедер новости
      renderHeader(currentNews)

      // Если есть авторский текст, то выносим его в хедер новости
      if (currentNews.text) {
        document.querySelector('.news__text').style.display = 'block'
      }

      // Получаем id-номера корневых комментариев
      rootCommentsIds = currentNews.kids

      // Загружаем комментарии
      loadComments()
    } catch (err) {
      hide(preloaderComments)
      commentsError.innerHTML = err.message
    }
  }

  // * Загрузка комментариев
  const loadComments = () => {
    clear(commentsError)
    clear(commentsWrapper)
    clear(commentsTitle)
    show(preloaderComments)
    if (rootCommentsIds) {
      disable(resetCommentsBtn)
      renderComments(rootCommentsIds, currentNews)
    } else {
      hide(preloaderComments)
      show(commentsMessage)
      enable(backBtn)
      enable(resetCommentsBtn)
    }
  }

  /**========================================================================
   * *                        Обработка событий
   *========================================================================**/

  // * Слушатели кнопок
  topBtn.addEventListener('click', () => init(topStoriesURL))
  newBtn.addEventListener('click', () => init(newStoriesURL))
  resetNewsBtn.addEventListener('click', reloadHomePage)
  backBtn.addEventListener('click', toHomePage)
  resetCommentsBtn.addEventListener('click', loadComments)

  // * Отображение страницы с новостью
  newsList.addEventListener('click', e => {
    e.preventDefault()

    const clicked = e.target.closest('.news-list__item')
    if (!clicked) return

    if (clicked.dataset.id == currentNews?.id) {
      showNewsPage()
    } else {
      const currentNewsId = clicked.dataset.id
      showNewsPage()
      show(preloaderComments)
      hide(commentsMessage)
      clear(newsItem)
      clear(commentsTitle)
      clear(commentsWrapper)
      newsItem.style.borderBottom = 'none'
      disable(resetCommentsBtn)
      disable(backBtn)
      renderNewsPage(currentNewsId)
    }
  })

  // * Раскрывающиеся комментарии
  commentsWrapper.addEventListener('click', e => {
    e.preventDefault()
    const clicked = e.target.closest('.comments__item')
    if (e.target.tagName === 'A') {
      window.open(e.target.innerHTML)
    }
    if (clicked) {
      const childComments = [
        ...clicked.querySelector('.child-comments').children,
      ]
      childComments.forEach(el => el.classList.toggle('hidden'))
      clicked.querySelector('.comments__answers')?.classList.toggle('up')
      clicked.querySelector('.has-child').classList.toggle('active')
    }
  })

  // * Кнопки сортировки по рейтингу / дате
  ratingBtn.addEventListener('click', function (e) {
    e.preventDefault()
    hide(ratingSvg)
    hidePseudoElements(dateBtn)
    show(dateSvg)
    const sortingBy = sortingLogic.bind(this)
    sortingBy('score')
  })
  dateBtn.addEventListener('click', function () {
    hide(dateSvg)
    hidePseudoElements(ratingBtn)
    show(ratingSvg)
    const sortingBy = sortingLogic.bind(this)
    sortingBy('date')
  })

  /**========================================================================
   * *                          Запуск приложения
   *========================================================================**/

  init(topStoriesURL)
})()
