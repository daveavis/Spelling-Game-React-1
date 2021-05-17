import React from 'react';
import ReactHtmlParser from "react-html-parser";
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        const file = 'words.txt';
        var msg = new SpeechSynthesisUtterance();
        msg.volume = 1; // From 0 to 1
        msg.rate = .8; // From 0.1 to 10
        msg.pitch = 0; // From 0 to 2
        msg.lang = 'en-US';
        this.state = {
            inputText : "",
            wordsList: this.fileGet(file).trim().split("\n"),
            correctWordsList: [],
            currentWord: "",
            showWord: false,
            msg: msg,
            voice: "",
            voices: [],
            voiceOptions: "",
            textStatus: "clear",   // 'clear' or 'keep'
        };

        this.textInput = React.createRef();

        this.createVoiceList = this.createVoiceList.bind(this);
    }

    componentDidMount(){
        if ('speechSynthesis' in window) {
        // Speech Synthesis supported
        } else {
            // Speech Synthesis Not Supported
            alert("Sorry, your browser doesn't support text to speech.");
        }
        let word = this.getNewWord();
        this.setState((state) => ({currentWord: word}));
        //console.log("createVoiceList = ", this.createVoiceList());
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = this.createVoiceList;
        }
        if('onvoiceschanged' in speechSynthesis){

        } else {  // for safari and iOS
            this.createFullVoiceList();
        }

        this.sayWord = this.sayWord.bind(this);
        this.checkWord = this.checkWord.bind(this);
        this.showMe = this.showMe.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.selectChangeHandler = this.selectChangeHandler.bind(this);
        this.createVoiceList = this.createVoiceList.bind(this);
    }

    fileGet(file) {
        let xmlhttp;
        
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            alert("Browser not supported");
        }
        
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                return xmlhttp.responseText;
            }
        }
        xmlhttp.open("GET", file, false);
        xmlhttp.send();
        
        return xmlhttp.response;
    }

    speak(message) {
        //while(speechSynthesis.speaking){
            // wait for the current speech to end
        //   console.log('Waiting for the current speech to end.');
        //}
        if(! speechSynthesis.speaking){
            window.speechSynthesis.cancel();
            let msg = this.state.msg;
            msg.text = message;
            speechSynthesis.speak(msg);
        }
        //speechSynthesis.getVoices().forEach(function(voice) {
        //    console.log(voice.name, voice.lang, voice.default ? voice.default :'');
        //});
    }

    sayWord(){
        this.speak(this.state.currentWord);
        if(this.state.textStatus === "clear"){
            this.setState({inputText : ""});
            this.setState({textStatus    : "keep"});
        }
        
        this.textInput.current.focus();
    }

    checkWord(){
        let guess = this.state.inputText;
        let currentWord = this.state.currentWord;
        if(guess === currentWord){
            this.setState({textStatus : "clear"});
            this.state.correctWordsList.push(currentWord);
            this.state.wordsList.splice(this.state.wordsList.indexOf(currentWord),1);
            this.speak("correct. " + currentWord + " is spelled " + this.spellWord(currentWord));
            if(this.state.wordsList.length > 0){
                this.setState((state) => { return {currentWord: this.getNewWord()}});
            } else {
                this.win();
            }
        } else {
            this.speak("try again. " + currentWord);
            //this.setState({textStatus:"keep"});
            this.setState((state) => { return {inputText:""} });      // clear the input field
        }
        this.textInput.current.focus();
    }

    showMe() {
        // show the correct spelling
        // say the correct spelling
        let word = this.state.currentWord;
        this.setState({inputText: word});
        this.setState({textStatus:"clear"});
        this.speak(word + " is spelled " + this.spellWord(word));
        // pick a new random word
        word = this.getNewWord();
        this.setState((state) => { return {currentWord: word} });
        // clear the input box
        this.textInput.current.focus();
    }

    getNewWord(){
        let words = this.state.wordsList;
        return words[Math.floor(Math.random() * words.length)];
    }

    win(){
        this.speak("you win");
        this.setState({state : this.state});
    }

    spellWord(word){
        let outString = '';
        for(let i = 0; i < word.length; i++){
            outString = outString + word[i] + ' ';
        }
        return outString;
    }

    changeHandler(event){
        this.setState({inputText: event.target.value});
        //it triggers by pressing the enter key
        if (event.key === 'Enter') {
            this.checkWord();
        }
    }

    selectChangeHandler(event){
        let voice = event.target.value;
        let msg = this.state.msg;
        let voices = this.state.voices;
        for(let i = 0; i < voices.length; i++){
            if(voices[i].name === voice){
                msg.voice = voices[i];
            }
        }
        this.setState({
                msg : msg,
                voice : voice
            });
    }

    createVoiceList() {
        var arr = [];
        var voiceOptionString = "";
        let voices = window.speechSynthesis.getVoices();
        //console.log("voices = ", voices);
        for (let i = 0; i < voices.length; i++) {
            //console.log(voices[i].name, voices[i].lang);
            if(voices[i].lang === 'en-US'){
                let name = voices[i].name;
                arr.push("<option key='"+name+"' value='"+name+"'>"+name+"</option>");
                voiceOptionString += "<option key='"+name+"' value='"+name+"'>"+name+"</option>";
            }
        }
        this.setState((state) => {return {voiceOptions : arr}});
        this.setState((state) => {return {voices : voices}});

        return voiceOptionString; 
    }

    createFullVoiceList() { // for iOS.  Put Alice voice first in the list.
        var arr = [];
        var voiceOptionString = "";
        let voices = window.speechSynthesis.getVoices();
        let alice = -1;

        for (let i = 0; i < voices.length; i++) {
            if (voices[i].name === 'Alice'){
                alice = i;
            }
        }
        if (alice !== -1) {
            let temp = voices[0];
            voices[0] = voices[alice];
            voices[alice] = temp;
        }
        for (let i = 0; i < voices.length; i++) {
                let name = voices[i].name;
                arr.push("<option key='"+name+"' value='"+name+"'>"+name+"</option>");
                voiceOptionString += "<option key='"+name+"' value='"+name+"'>"+name+"</option>";
        }

        this.setState((state) => {return {voiceOptions : arr}});
        this.setState((state) => {return {voices : voices}});

        return voiceOptionString; 
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    render() {
        return (
            <div>
                <button 
                    id='say-word'
                    onClick={this.sayWord}>
                        Say Word
                </button>
                <button 
                    id='check-it'
                    onClick={this.checkWord}>
                        Check It
                </button>
                <button 
                    id='show-me'
                    onClick={this.showMe}>
                        Show Me
                </button>
                
                <br/>
                <input 
                    id='attempt' 
                    type='text'
                    ref={this.textInput} 
                    value={this.state.inputText}
                    onChange={this.changeHandler}
                    onKeyPress={this.changeHandler}
                    spellCheck="false"
                />
                <p id='correct'>
                    Words Correct: {this.state.correctWordsList.length}
                </p>
                <p id='words-left'>
                    Words Left: {this.state.wordsList.length}
                </p>
                <span id='voice-select'>
                    Select a Voice:&nbsp;
                    <select id='voice-select'
                            onChange={this.selectChangeHandler}>
                        {ReactHtmlParser(this.state.voiceOptions)}
                    </select>
                </span>
            </div>
        );
    }
}

export default App;
