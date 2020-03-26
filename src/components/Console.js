import React from 'react';

import dompurify from 'dompurify';
import Draggable from 'react-draggable';

import { isMobile } from 'react-device-detect';

import { ascii_picture, ascii_cat } from './ascii.js';

import githubIcon from '../media/github.png';
import reactIcon from '../media/react.svg';
import visualIcon from '../media/vstudio.svg';
import stackIcon from '../media/so.svg';
import newsIcon from '../media/news.svg';
// import pdfIcon from '../media/pdf.svg';
import ozIcon from '../media/oz.svg';
import commodoreIcon from '../media/commodore.svg';
import youtubeIcon from '../media/youtube.svg';
import emailIcon from '../media/email.svg';
import pizzaIcon from '../media/pizza.svg';

import './Console.css';
import './console-mobile.css';

const openTime = new Date();
let loadTime = '';

export default function Console(props) {

  const [input, setInput] = React.useState('');
  const [dosbox, setDosbox] = React.useState([]);
  const [consoleLocation, setConsoleLocation] = React.useState({
    left: 50,
    top: 50,
    width: window.innerWidth * 60 / 100,
    height: window.innerHeight * 60 / 100,
  },[]);

  React.useEffect(()=>{
    // This will show the welcome message with the commands
    executeCommand('help');
    loadTime = new Date() - openTime;
  },[]);

  const removeScrollElement = () => {

    if (document.querySelector('.scroll-here')) {
      // Here we remove the scroll-to line to prevent scrolling again there
      const removeScrollClass = dosbox.map((e)=>{
        if (e.classes === 'scroll-here') e = '';
        return e;
      });
      return removeScrollClass;
    } else {
      return dosbox;
    }
    
  }

  React.useEffect(()=>{

    // Used to debounce the resize event
    function debounce(fn, ms) {
      let timer
      return _ => {
        clearTimeout(timer)
        timer = setTimeout(_ => {
          timer = null
          fn.apply(this, arguments)
        }, ms)
      };
    }

    // The element with class absolute-me is the wrapper of the console and it's the resizable div
    const mainWindow = document.querySelector('.absolute-me');

    if (mainWindow) {
      mainWindow.style.width = consoleLocation.width + 'px';
      mainWindow.style.height = consoleLocation.height + 'px';
    }

    const debouncedHandleResize = debounce(function handleResize() {
      setConsoleLocation({...consoleLocation, width: (parseInt(window.innerWith) * 60 / 100), height: (parseInt(window.innerHeight) * 60 / 100) })
    }, 100)

    const handleDragConsole = ()=> {
      setConsoleLocation({...consoleLocation, left: parseInt(mainWindow.getBoundingClientRect().left), top: parseInt(mainWindow.getBoundingClientRect().top) });
      setDosbox(removeScrollElement);
    }

    const handleResizeConsole = (e)=> {
      if (e.target.classList.contains('console-container')) {
        console.log('resized');
        let width = mainWindow.getBoundingClientRect().width;
        let height = mainWindow.getBoundingClientRect().height;
        if (width > window.innerWidth) width = window.innerWidth - mainWindow.getBoundingClientRect().left;
        if (height > window.innerHeight) height = window.innerHeight - mainWindow.getBoundingClientRect().top;
        setConsoleLocation({...consoleLocation, width: width, height: height })
        setDosbox(removeScrollElement);
      }
    }

    if (!isMobile) {

      // Scroll down to the bottom of the console
      const mainConsole = document.querySelector('.main-box');

      mainConsole.scrollTop = mainConsole.scrollHeight;

      // Sometimes the console is scrolled to a specific line (that has the class scroll-here) in case the text is too long,
      // so the user can see the first line and scroll down himself
      
      const scrollHere = document.querySelector('.scroll-here');

      if (scrollHere) {
        var topPos = scrollHere.offsetTop;
        mainConsole.scrollTop = topPos;
      }

      // To allow the user to drag the window around
      document.querySelector('.handle').addEventListener('mouseup', handleDragConsole);
      mainWindow.addEventListener('mouseup', handleResizeConsole);
      //mainWindow.addEventListener('mouseleave', handleResizeConsole)
      window.addEventListener('resize', debouncedHandleResize);

    }

    return ()=>{
      if (!isMobile) {
        document.querySelector('.handle').removeEventListener('mouseup', handleDragConsole);
        mainWindow.removeEventListener('mouseup', handleResizeConsole);
        //mainWindow.removeEventListener('mouseleave', handleResizeConsole)
        window.removeEventListener('resize', debouncedHandleResize);
      }
    }

  })

  // After sanitizing the input we execute the command
  function handleKey(e) {
      switch (e.key) {
        case 'Enter' || 'NumpadEnter':
          const sanitizer = dompurify.sanitize;
          executeCommand(sanitizer(input));
          break;
        default:
          if (document.querySelector('.scroll-here')) setDosbox(removeScrollElement);
          break;
      }
  }

  /**
   * 
   * @param {string} command The commnand that will be executed or the link that will be opened
   * @param {string} type The type can be info, link or ascii
   * @param {string} text The text of the command (usually the text shown to the user)
   * @param {string} description The textual description of the command
   * @param {icon} icon The icon used for the link
   * @param {string} classes Any additional class that might be used on the text shown (for example 'fancy' for the glowing effect)
   */
  function addConsoleOutput(command, type, text, description, icon, classes) {
    return ({
      command: command,
      type: type,
      text: text,
      description: description,
      icon: icon,
      classes: classes,
    })
  }

  /**
   * This function executes the command and show to the user the relevant output
   * 
   * @param {string} command This is the command that will be executed
   */
  function executeCommand(command) {

    // Sometimes the console is scrolled to a specific line (check the useEffect function)
    // but once the next command is executed, I get rid of the bookmark to prevent the scrolling
    // from happening again


    // This variable holds the length of the console in lines at this point
    // After we add the new lines we calculate the difference and remove
    // the same number of oldest lines in case we reached the max length
    // of the console lines (100 lines)
    const previousLength = dosbox.length;

    let tempCommands = [];

    if (!isMobile) {
      if (document.querySelector('.scroll-here')) {
        // Here we remove the scroll-to line to prevent scrolling again there
        const removeScrollClass = dosbox.map((e)=>{
          if (e.classes === 'scroll-here') e = '';
          return e;
        });
        tempCommands = [...removeScrollClass, addConsoleOutput(command, 'info', 'C:\\>' + command)];
      } else {
        tempCommands = [...dosbox, addConsoleOutput(command, 'info', 'C:\\>' + command)];;
      }
    }
    
    // Add a blank line to improve layout
    command !== '' && tempCommands.push(addConsoleOutput('', 'info', ' '));

    // We always add a menu link to help the user navigate the site in case he prefers clicking unless he already has the menu visible (back / help / menu / home)
    if (isMobile && command !== 'help' && command !== 'menu') {
      tempCommands.push(addConsoleOutput('help', 'link', '[ MENU ]', ' '));
    }

    switch(command.toLowerCase().trim()) {
      case 'author':
          tempCommands.push(addConsoleOutput('', 'info', ' ', '', '', 'scroll-here'));
          tempCommands.push(addConsoleOutput('', 'info', 'Reale Roberto Josef Antonio', '', '', 'fancy'));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('', 'info', 'Scroll down to read more...'));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('mailto:roberto.reale.ja@gmail.com', 'link', 'EMAIL', 'roberto.reale.ja@gmail.com.', emailIcon));
          tempCommands.push(addConsoleOutput('https://github.com/sickdyd', 'link', 'GITHUB', 'Check out my GitHub.', githubIcon));
          // tempCommands.push(addConsoleOutput('https://sugoi.online/sickdyd/roberto_reale_online.pdf', 'link', 'RESUME', 'Download my resume.', pdfIcon));
          tempCommands.push(addConsoleOutput('https://www.youtube.com/channel/UC1qfRe9FZ46DqRvkl6XoK2g', 'link', 'YOUTUBE', 'Check out my music on YouTube.', youtubeIcon));
          tempCommands.push(addConsoleOutput('https://sugoi.online/', 'link', 'SUGOI', 'Take a look at my Italian food events.', pizzaIcon));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('', 'info', 'The first time I wrote some code I was 8 years old; at the time I just copied code from my Commodore 16 manual.', '', commodoreIcon));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('https://www.thegamesmachine.it/', 'link', '[ TGM ]', 'When I was 14 years old I started developing simple 2D games with Turbo Pascal. A few of them got published on the talent scout area of The Games Machine, an Italian video games magazine.'));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('http://www.2ms-it.com/', 'link', '[ 2Ms ]', 'During my last year of high school, I started working at 2Ms Centro Studi Tecnici, where thanks to Massimo Mascalchi and his books, I had the opportunity to learn to code with ASP, MDB and IIS.'));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('https://www.unimib.it/', 'link', '[ UNIMIB ]', 'In July 2004 I won a job competition for an employment at the University of Milan-Bicocca, where I worked as computer technician for about 9 years. Here I took care of every IT aspect, building excellent troubleshooting skills.'));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('', 'info', 'Looking for new challenges and experiences, in 2013 I moved to Australia where I worked for 2 years in construction and farming.', '', ozIcon));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
          tempCommands.push(addConsoleOutput('https://nova-holdings.jp/hd_en/?page=online_ocha', 'link', '[ NOVA ]', 'In 2015 I moved to Japan, Osaka, and started working at Nova as a JavaScript programmer and Italian teacher. This is my current position.'));
          break;
      case 'clear':
        tempCommands = [];
        break;
      case 'dir':
      //(command, type, text, description, icon, classes) {
        tempCommands.push(addConsoleOutput('', 'info', 'Volume in drive C is ROB_OS'));
        tempCommands.push(addConsoleOutput('', 'info', 'Volume Serial Number is R0BY-R34'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('cat'    , 'dir', 'cat.bat',     ['23/09/2019 17:10', '8,526']));
        tempCommands.push(addConsoleOutput('picture', 'dir', 'picture.bat', ['28/11/2016 17:10', '12,954']));
        tempCommands.push(addConsoleOutput('github' , 'dir', 'github.lnk',  ['24/10/2019 11:13', '501']));
        // tempCommands.push(addConsoleOutput('resume' , 'dir', 'resume.pdf',  ['24/10/2019 11:13', '81,770']));
        break;
      case 'back':
      case 'home':
      case 'help':
      case 'menu':
        tempCommands.push(addConsoleOutput('', 'info', 'Welcome to Sickdyd\'s console.', '', '', 'fancy'));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', ' '));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', 'You can navigate this website by typing commands or by clicking on the links.'));
        tempCommands.push(addConsoleOutput('','info', ' '));
        tempCommands.push(addConsoleOutput('', 'info', 'The available commands are:'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('author', 'link', 'AUTHOR', 'Shows information about the author of this website.'));
        !isMobile && tempCommands.push(addConsoleOutput('clear', 'link', 'CLEAR', 'Clears the console.'));
        !isMobile && tempCommands.push(addConsoleOutput('dir', 'link', 'DIR', 'Displays a list of files and subdirectories in a directory.'));
        !isMobile && tempCommands.push(addConsoleOutput('help', 'link', 'HELP', 'Provides Help information for the console commands.'));
        tempCommands.push(addConsoleOutput('info', 'link', 'INFO', 'Get some technical information about the console.'));
        !isMobile && tempCommands.push(addConsoleOutput('toggle', 'link', 'TOGGLE', 'Show or hide the background links.'));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', ' '));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', 'Click on the left to open the link or type the command.'));
        break;
      case 'github':
      case 'github.lnk':
        tempCommands.push(addConsoleOutput('', 'info', 'Opening GitHub link...',));
        window.open('https://github.com/sickdyd/sickdyd', "_blank")
        break;
      case 'format c:':
        tempCommands.push(addConsoleOutput('', 'info', 'The drive C (yours) will be formatted on reboot.'));
        break;
      case 'info':
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', ' ', '', '', 'scroll-here'));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', 'Hover the mouse on the background to zoom articles, click to open.'));
        isMobile && tempCommands.push(addConsoleOutput('', 'info', 'To experience the website functionality in its full, please use a computer.'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', 'You can drag the console around and resize it.'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', 'The page is still work in progress and so far it has been tested only on Firefox and Chrome.'));
        !isMobile && tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('https://reactjs.org/', 'link', 'ReactJS', 'This website was developed with ReactJS.', reactIcon));
        tempCommands.push(addConsoleOutput('https://code.visualstudio.com/', 'link', 'Visual Studio Code', 'The IDE used was Visual Studio Code.', visualIcon));
        !isMobile && tempCommands.push(addConsoleOutput('https://stackoverflow.com/', 'link', 'Stack Overflow', 'News on the background may be fetched from SO.', stackIcon));
        !isMobile && tempCommands.push(addConsoleOutput('https://newsapi.org/', 'link', 'News Api', 'News on the background may be fetched from newsapi.org.', newsIcon));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('', 'info', 'Dependencies'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('https://www.npmjs.com/package/axios', 'link', 'axios', 'Promise based HTTP client for the browser and node.js.'));
        tempCommands.push(addConsoleOutput('https://www.npmjs.com/package/dompurify', 'link', 'dompurify', 'DOMPurify is an XSS sanitizer for HTML, MathML and SVG.'));
        tempCommands.push(addConsoleOutput('https://www.npmjs.com/package/uuidv4', 'link', 'uuidv4', 'Creates v4 UUIDs.'));
        tempCommands.push(addConsoleOutput('https://www.npmjs.com/package/react-device-detect', 'link', 'react-device-detect', 'Detect device, and render view according to detected device type.'));
        tempCommands.push(addConsoleOutput('https://www.npmjs.com/package/react-draggable', 'link', 'react-draggable', 'A simple component for making elements draggable.'));
        tempCommands.push(addConsoleOutput('', 'info', ' '));
        tempCommands.push(addConsoleOutput('', 'info', 'This website took ' + loadTime + 'ms to load.'));
        break;
      case 'picture':
      case 'picture.bat':
          tempCommands.push(addConsoleOutput('', 'ascii', ascii_picture));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
        break;
        case 'cat':
        case 'cat.bat':
          tempCommands.push(addConsoleOutput('', 'ascii', ascii_cat));
          tempCommands.push(addConsoleOutput('', 'info', ' '));
        break;
      // case 'resume':
      // case 'resume.pdf':
      //     tempCommands.push(addConsoleOutput('', 'info', 'Opening resume...',));
      //     window.open('https://sugoi.online/sickdyd/roberto_reale_online.pdf', "_blank")
      //     break;
      case 'toggle':
          tempCommands.push(addConsoleOutput('', 'info', props.background ? 'Removing background...' : 'Adding background...'));
          //Array.from(document.getElementsByClassName('hex')).forEach(e=>e.classList.toggle('text-shadow'));
          props.setBackground(!props.background);
          break;
      case '':
        break;
      default:
        command='help';
        tempCommands.push(addConsoleOutput('', 'info', 'Syntax error. Type \'help\' for a list of available commands.'));
    }

    if (command === 'author' || command === 'dir' || command === 'info' || command === 'clear') { 
      tempCommands.push(addConsoleOutput('', 'info', ' '));
      tempCommands.push(addConsoleOutput('help', 'link', '[ MENU ]', ' '));
      tempCommands.push(addConsoleOutput('', 'info', ' '));
    } else {
      (command!=='') && tempCommands.push(addConsoleOutput('', 'info', ' '));
    }

    if (tempCommands.length > 100) tempCommands.splice(0, tempCommands.length - previousLength);

    setDosbox([...tempCommands]);
    setInput('');
  }

  /**
   * This function converts the command to the actual JSX
   * 
   * @param {object} props A command type object
   */
  function ConvertToHtml(props) {
    switch (props.command.type) {
      case 'ascii':
        return <div id={isMobile ? 'ascii-text' : ''} className='ascii-text'>
                {props.command.text.map((t, index)=>{
                  return <span key={Math.random() * index}>{t}<br/></span>
                })}
              </div>
      case 'info':
        return (
          // If the user is on mobile we overrides the class rules with the id rules
          <div key={props.index} id={isMobile ? 'line-container' : ''} className='line-container'>
            <span id={isMobile ? 'dos-text' : ''} className='dos-text'>
              {props.command.icon && <img className='icon' src={props.command.icon} alt={''}/>}
              <span className={props.command.classes}>{props.command.text}</span>
              <span>{props.command.description}</span>
            </span>
          </div>
        )
      case 'link':
      case 'fancy':
        return  (
          <div key={props.index} id={isMobile ? 'line-container' : ''} className='line-container'>
            <span style={{width: isMobile ? 'auto' : '25%', alignSelf: 'flex-start'}} id={isMobile ? 'console-link' : ''} className='console-link'
                onClick={()=>(props.command.command.includes('http') || props.command.command.includes('mailto')) ? window.open(props.command.command, "_blank") : executeCommand(props.command.command)}
                >
                {props.command.text}
            </span>
            <span style={{width: isMobile ? 'auto' : '75%', alignSelf: isMobile ? 'flex-start' : 'flex-end'}}>
              {props.command.icon && <img className='icon' src={props.command.icon} alt={''}/>}
              {props.command.description ? props.command.description : props.command.text}
            </span>
            {isMobile && <br/>}
          </div>
        )
      case 'dir':
          return (
          <div key={props.index} id={isMobile ? 'line-container' : ''} className='line-container'>
            <span className='dos-text' style={{width: 'auto', alignSelf: 'flex-start'}} >
                {props.command.description[0]}
            </span>
            <span className='dos-text' style={{width: '15%', alignSelf: 'flex-end', textAlign: 'right', marginRight: '15px'}} >
                {props.command.description[1]}
            </span>
            <span style={{width: '20vmax', alignSelf: isMobile ? 'flex-start' : 'flex-start'}}
                  id={isMobile ? 'console-link' : ''} className='console-link'
                  onClick={()=>(props.command.command.includes('http') || props.command.command.includes('mailto')) ? window.open(props.command.command, "_blank") : executeCommand(props.command.command)}
            >
              {props.command.icon && <img className='icon' src={props.command.icon} alt={''}/>}
              {props.command.text ? props.command.text : props.command.text}
            </span>
            {isMobile && <br/>}
          </div>
          )
      default:
        break;
    }
    return null;
  }

  // This is used to change the type of rendering for mobile or not
  const ConditionalWrapper = ({ condition, wrapper, children }) => 
    condition ? wrapper(children) : children;

  return (
    
    <ConditionalWrapper
      condition={!isMobile}
      wrapper={children => <Draggable
          handle='.handle'
          defaultPosition={{x: consoleLocation.left, y: consoleLocation.top}}
          bounds={{top: 0, left: 0, bottom: parseInt(window.innerHeight) - parseInt(consoleLocation.height), right: parseInt(window.innerWidth) - parseInt(consoleLocation.width) }}>
          {children}
      </Draggable>}
    >

      <div id={isMobile ? 'console-container' : ''} className={isMobile ? 'console-container' : 'console-container absolute-me'}>

        {!isMobile && <div className='handle'>D  R  A  G    M  E</div>}

        <div id={isMobile ? 'main-box' : ''} className='main-box'>
        {/* <div id={isMobile ? 'main-box' : ''} className='main-box' onClick={()=>!isMobile && document.querySelector('.dos-input').focus()}> */}

            <div className='.dosbox'>

              {dosbox.map((command, index)=>{
                return <ConvertToHtml key={Math.random() * index} index={index} command={command}/>
                })
              }

            <div id={isMobile ? 'line-container' : ''} className={isMobile ? 'line-container command-line-mobile' : 'line-container'}>

                <span className='fancy'>C:\></span>
                
                {!isMobile ? <input
                  autoFocus
                  type='text'
                  value={input}
                  spellCheck='false'
                  className='dos-input'
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>handleKey(e)}
                /> :
                  'prompt unavailable on mobile'
                }

            </div>

          </div>

        </div>

      </div>

    </ConditionalWrapper>
  )
}

