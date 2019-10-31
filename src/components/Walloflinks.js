import React from 'react';
import uuidv4 from 'uuidv4';
import axios from 'axios';
import dompurify from 'dompurify';

import { isMobile, isFirefox } from 'react-device-detect';

import './Walloflinks.css';

export default function Walloflinks() {

  const [hive, setHive] = React.useState([]);

  React.useEffect(()=>{
    generateBackground([
      'https://api.stackexchange.com/2.2/questions?order=desc&sort=activity&site=stackoverflow',
      //'https://newsapi.org/v2/everything?language=en&q=javascript&sortBy=publishedAt&apiKey=17995ab1154b41418509cf4510e75fdc',
    ]);

  }, []);

  /**
   * @function generateBackground This function requests data from a provided link and if it succeed it returns the data, otherwise null
   * @param {string} URL The URL the function will get the list of titles to use for the background
   */

  function generateBackground(URLs) {

    // Pre fill the background with random strings, in case the remote requests fail

    const dummyTitles = [];
    for (let i = 0; i < 10; i++) dummyTitles.push({ title: Math.random().toString(36).slice(-5), link: ''});
    createTitlesArray(dummyTitles, 100).then( refinedTitles => setHive(refinedTitles));

    // For each url provided, send an axios request, if one of the requests succeed, retrieve the titles

    let completed = false;

    let failureCounter = 0;
    
    URLs.forEach( URL=> {
      axios.get(URL)
      .then(res => {
        if (!completed) {
          document.querySelector('.fader-container').classList.add('fader');
          completed = true;
          console.log('Setting background titles from: ' + URL);
          const rawTitles = extractTitles(res);
          createTitlesArray(rawTitles, 100).then( refinedTitles => setHive(refinedTitles));
        }
      })
      .catch(e=>{
        failureCounter++;
        // If all the requests fail, fade in the background with the random strings
        (failureCounter >= URLs.length) && document.querySelector('.fader-container').classList.add('fader');
        console.log(URL, e)
      })
    }); 

  }

  /**
   * @function extractTitles Returns an array with the list of titles
   * @param {object} res The response obtained from the request
   */

  function extractTitles(res) {
    const titles = res.data.items ? res.data.items : res.data.articles;
    return titles.map(item => { return { title: item.title, link: item.link || item.url }; });
  }

  /**
   * @function createTitlesArray Generates all the text parameters that will be used to create the div tags of the background
   * @param {array} titles An array containing all the titles that will be displayed on the background
   * @param {int} howMany The number of items that will be displayed on the background, if the request provided less titles, just reuse the same titles more than once
   */

  function createTitlesArray(titles, howMany) {

    howMany = isFirefox ? 70 : howMany;
    howMany = isMobile ? 20 : howMany;

    return new Promise(async (resolve) => { 

      const h = [];
      let counter = 0;

      while (counter < howMany) {

        for (let n = 0; n < titles.length; n++) {

          const hex = {
            id: uuidv4(),
            width: '5vw',
            height: '3vh',
            top: (Math.random() * 100) + 'vh',
            left: (Math.random() * 100) + 'vw',
            html: titles[n].title,
            link: isMobile ? '' : titles[n].link,
          }

          h.push(hex);

          counter++;
          if (counter >= howMany) break;
        }
      }

      resolve(h);
      
    });
  }

  /**
   * @param {event} e The event object that will be used to apply classes
   */

  function startAnimation(e) {
    e.target.classList.remove('hex-zoom-out');
    e.target.classList.remove('hex-zoom-in');
    e.target.classList.add('hex-zoom-in');
    e.target.addEventListener('animationend', (e)=>handleClasses(e));
  }

  function handleClasses(e) {
    e.target.classList.remove('hex-zoom-in');
    e.target.removeEventListener('animationend', handleClasses);
  }

  function createMarkup(v) { 
    const sanitizer = dompurify.sanitize;
    return {__html: sanitizer(v)}
  };

  return (hive.map((hex)=>
          <div
            key={hex.id}
            id={hex.id}
            className={`hex hex-zoom-out text-shadow`}
            style={{ width: hex.width, height: hex.height, top: hex.top, left: hex.left }}
            dangerouslySetInnerHTML={createMarkup(hex.html)}
            onClick={(e)=>{
              isMobile ? e.preventDefault() : hex.link && window.open(hex.link, "_blank")}
            }
            onMouseOver={(e)=>hex.link ? '' : e.target.style.cursor = 'default'}
            onMouseEnter={(e)=>!isMobile && startAnimation(e)}
          />
      )
  ) 

}