// ==UserScript==
// @name         pricetags on image grid view
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       nubleh
// @match        https://scryfall.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
{
if (document.querySelector('[name=as]').value === 'grid') {
  return;
  const items = [...document.querySelectorAll('.card-grid-item-card')];
  const run = (item) => {
    fetch(item.href).then(r => r.text()).then(t => {
      const dummy = document.createElement('div');
      dummy.innerHTML = t;
      const price = dummy.querySelector('.prints-table tr.current').children[1].innerText.trim();
      const priceTag = document.createElement('div');
      priceTag.innerHTML = price;
      item.appendChild(priceTag);
      priceTag.style.position = 'absolute';
      priceTag.style.bottom = '1px';
      priceTag.style.left = '50%';
      priceTag.style.zIndex = '999';
      priceTag.style.color = '#fff';
      priceTag.style.background = '#000';
      priceTag.style.transform = 'translateX(-50%)';


      const next = items[items.indexOf(item) + 1];
      if (next) {
        setTimeout(() => {
          run(next);
        }, 500);
      }
    });
  };
  run(items[0]);
}
}

{
if (document.querySelector('[name=as]').value === 'checklist') {
  let changeMode = false;
  const items = [...document.querySelectorAll('#js-checklist tbody tr')];

  const run = () => {
    if (changeMode) {
      document.querySelector('#card-tooltip').style.transform = 'scale(0)';
      document.querySelector('.checklist').style.display = 'block';
      document.querySelector('.checklist tbody').style.display = 'block';
      document.querySelector('.checklist-wrapper').style.maxWidth = 'none';
      document.querySelector('.checklist-wrapper').style.padding = '0 40px';
      document.querySelector('.checklist').style.maxWidth = 'none';
      items.forEach(el => {
        el.style.display = 'inline-block';
        el.style.borderTop = 'solid 30px transparent';
        [...el.children].forEach((c, i) => {
          if (i !== 2 && i !== 8) {
            c.style.display = 'none';
          } else {
            c.style.display = 'block';
          }
          c.style.lineHeight = '0.4em';
          c.style.width = '200px';
        });
        el.children[el.children.length - 1].style.display = '';
      });
    } else {
      document.querySelector('#card-tooltip').style.transform = '';
      document.querySelector('.checklist').style.display = '';
      document.querySelector('.checklist tbody').style.display = '';
      document.querySelector('.checklist-wrapper').style.maxWidth = '';
      document.querySelector('.checklist-wrapper').style.margin = '';
      document.querySelector('.checklist').style.maxWidth = '';
      items.forEach(el => {
        el.style.display = '';
        el.style.borderTop = '';
        [...el.children].forEach(c => {
          c.style.display = '';
          c.style.width = '';
          c.style.lineHeight = '';
        });
        el.children[el.children.length - 1].style.display = 'none';
      });
    }
  };

  items.forEach(el => {
    const img = el.getAttribute('data-card-image');
    const imgCol = document.createElement('td');
    imgCol.innerHTML = `<img src="${img}" width="200">`;
    imgCol.style.display = 'none';
    el.appendChild(imgCol);
  });

  document.querySelector('thead').oncontextmenu = () => {
    changeMode = !changeMode;
    run();
  };
}
}
  // Your code here...
})();