// ==UserScript==
// @name         reddit mtg cards
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  put inline pictures of mtg cards on reddit
// @author       /u/nublargh
// @match        https://*.reddit.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  {

    const style = document.createElement('style');
    const dur = '0.25s';
    let scale = 0.135;
    style.innerHTML = `
      .inline-mtg {
        height: 70vh;
        vertical-align: top;
        border-radius: 10px;
      }
      .inline-mtg-tiny {
        vertical-align: middle;
        margin: 1px;
        border-radius: 4px;
        display: inline-block;
        background-size: 61px auto;
        width: 51px;
        height: 37px;
        background-position: -5px -10px;
      }
      .inline-mtg-box {
        display: inline-block;
        vertical-align: middle;
        background: #fff;
        font-size: 0.6em;
        padding: 0 4px 0 0;
        border-radius: 4px;
        margin: 1px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      #inline-mtg-hover {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 999;
      }
      #inline-mtg-hover img {
        transition: transform ${dur}, opacity ${dur};
        transition-delay: 0s, ${dur};
        transform-origin: center 33%;
      }
    `;
    document.body.appendChild(style);
    let hoverUrl = '';
    const hoverPic = (e) => {
      if (!e.target.classList.contains('inline-mtg-tiny')) {
        return;
      }
      const el = e.target;
      const url = el.getAttribute('data-img');
      if (url !== hoverUrl) {
        hoverUrl = url;
        renderHover(el);
      }
    };

    const unhoverPic = (e) => {
      if (!e.target.classList.contains('inline-mtg-tiny')) {
        return;
      }
      const el = e.target;
      const url = el.getAttribute('data-img');
      if (url === hoverUrl) {
        hoverUrl = '';
        renderHover(el);
      }
    };

    document.body.addEventListener('mouseover', hoverPic);
    document.body.addEventListener('mouseout', unhoverPic);

    function getCards(){

      const cards = [
        ...Array.from(document.querySelectorAll("a[href*='c1.scryfall.com/file']")),
        ...Array.from(document.querySelectorAll("a[href*='img.scryfall.com/cards']")),
        ...Array.from(document.querySelectorAll("a[href*='gatherer.wizards.com/Handlers/Image.ashx']")),
      ];
      cards.forEach(function(el){
        const basePath = el.href;
        const name = el.innerText.trim();
        const path = basePath.indexOf('img.scryfall.com/cards') === -1 ? basePath : `https://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=${name}`;
        el.setAttribute('target', '_blank');
  
        const comments = [
          ...Array.from(document.querySelectorAll('p')),
        ];
        const regexp = new RegExp(`\\[\\[${name}\\]\\]`, 'ig');
        const imgSmall = `
          <img src="${path}" class="inline-mtg">
        `;
        const imgTiny = `
          <div class="inline-mtg-tiny" style="background-image: url('${path}');" data-img="${path}"></div>
        `;
        comments.forEach(function(commentEl){
          if (commentEl.innerHTML.match(regexp)) {
            if (commentEl.innerHTML.indexOf(imgSmall) !== -1) {
              return;
            }
            if (commentEl.innerHTML.indexOf(imgTiny) !== -1) {
              return;
            }
            commentEl.innerHTML = commentEl.innerHTML.replace(regexp, function(str){
              return `
                <div class="inline-mtg-box">
                  ${imgTiny}
                  ${str}
                </div>
              `;
            });
          }
        });
  
      });
    }
    getCards();
    document.body.addEventListener('contextmenu', getCards);

    {
      let hoverBox = document.getElementById('inline-mtg-hover');
      if (!hoverBox) {
        hoverBox = document.createElement('div');
        hoverBox.id = 'inline-mtg-hover';
        document.body.appendChild(hoverBox);
        hoverBox.innerHTML = `<img src="https://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=meow" class="inline-mtg" style="opacity: 0; transform: scale(${scale});">`;
      }
    }

    function renderHover(targetEl){
      const hoverBox = document.getElementById('inline-mtg-hover');
      if (hoverUrl) {
        hoverBox.querySelector('img').src = hoverUrl;
      }
      const rect = targetEl.getClientRects()[0];
      const hoverRect = hoverBox.getClientRects()[0];
      const leftoffset = Math.min(0, rect.x + (rect.width / 2) - (hoverRect.width / 2));
      const topoffset = Math.min(0, rect.y + (rect.height / 2) - (0.35 * hoverRect.height));
      const rightOffset = Math.min(0, window.innerWidth - (rect.x + (rect.width / 2) + (0.5 * hoverRect.width)));
      const bottomOffset = Math.min(0, window.innerHeight - (rect.y + (rect.height / 2) + (0.65 * hoverRect.height)));
      const img = hoverBox.querySelector('img');
      scale = rect.height / ((296 / 680) * hoverRect.height);
      img.style.transform = `scale(${scale})`;

      if (hoverUrl) {
        hoverBox.style.transform = `
          translateX(${rect.x + (rect.width / 2)}px)
          translateX(-50%)
          translateY(${rect.y + (rect.height / 2)}px)
          translateY(-33%)
        `;
        const newTransform = `
          ${leftoffset < 0 ? `translateX(${0 + 10 - leftoffset}px)` : ''}
          ${topoffset < 0 ? `translateY(${0 - topoffset}px)` : ''}
          ${rightOffset < 0 ? `translateX(${rightOffset - 10}px)` : ''}
          ${bottomOffset < 0 ? `translateY(${bottomOffset - 10}px)` : ''}
        `
        img.style.transform = newTransform.trim();
        img.style.opacity = '';
        img.style.transitionDelay = `${dur}, 0s`;
      } else {
        hoverBox.style.transform = `
          translateX(${rect.x + (rect.width / 2)}px)
          translateX(-50%)
          translateY(${rect.y + (rect.height / 2)}px)
          translateY(-33%)
        `;
        img.style.transform = `scale(${scale})`;
        img.style.opacity = '0';
        img.style.transitionDelay = ``;
      }
    }

  }
})();