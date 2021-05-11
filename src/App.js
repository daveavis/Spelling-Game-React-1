import React from 'react';
import ReactHtmlParser from "react-html-parser";
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        const file = 'words.txt';
        var msg = new SpeechSynthesisUtterance();
        //let voices = window.speechSynthesis.getVoices();
        //console.log(voices);
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
            //voices: window.speechSynthesis.getVoices(),
        };
        //this.setState((state) => ({voices: window.speechSynthesis.getVoices()}));
        
        //this.createVoiceList();
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
        //console.log("createVoiceList = ", this.createVoiceList());
        //this.setState((state) => {return {voices: window.speechSynthesis.getVoices()}});
        //console.log(this.state.voices);
        // wait on voices to be loaded before fetching list
//        window.speechSynthesis.onvoiceschanged = () => {
//            let voices = [];
//            //this.setState({voices: voices});
//            window.speechSynthesis.getVoices().forEach(function(voice) {
//                this.state.voices.push(voice);
//                //console.log(voice.name, voice.lang, voice.default ? voice.default :'');
//            });
//            this.setState((state) => {return {voices: voices}});
//        };
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

        // while msg.speaking { do nothing }
        // need to make msg global
        // maybe search through voices for lang = en-US
        window.speechSynthesis.cancel();
        //var msg = new SpeechSynthesisUtterance();
        //var voices = window.speechSynthesis.getVoices();
        //console.log(voices);
        //let voiceName = 'Google US English';
        //let index = 0;
        //for(let i = 0; i < voices.length; i++){
        //    if(voices[i].lang === 'en-US'){
        //        index = i;
        //    }
        //}
        //msg.voice = voices[index]; 
        //msg.volume = 1; // From 0 to 1
        //msg.rate = .8; // From 0.1 to 10
        //msg.pitch = 0; // From 0 to 2
        let msg = this.state.msg;
        msg.text = message;
        //this.setState((state) => {return {msg: msg}});
        //this.state.msg.text = message;
        //msg.lang = 'en-US';
        speechSynthesis.speak(msg);
        //speechSynthesis.getVoices().forEach(function(voice) {
        //    console.log(voice.name, voice.lang, voice.default ? voice.default :'');
        //});
    }

    sayWord(){
        this.speak(this.state.currentWord);
        this.setState({inputText : ""} );
        this.textInput.current.focus();
    }

    checkWord(){
        let guess = this.state.inputText;
        let currentWord = this.state.currentWord;
        if(guess === currentWord){
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
            this.setState((state) => { return {inputText:""} });      // clear the input field
            // pause
            //this.speak(currentWord);
        }
        this.textInput.current.focus();
    }

    showMe() {
        // show the correct spelling
        // say the correct spelling
        let word = this.state.currentWord;
        this.setState({inputText: word});
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
        //console.log("voices = " + voices);
        //console.log("msg = " + msg.voice);
        //console.log("event = " + event.target.value);
        for(let i = 0; i < voices.length; i++){
            if(voices[i].name === voice){
                msg.voice = voices[i];
                //console.log("Voice Found: " + i + " " + msg.voice);
            } else {
                //console.log("Not Found");
            }
        }
        //msg.voice = event.target.value;
        //console.log("msg.voice = " + msg.voice);
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
            //arr.push(<option key={i} value="{i}">{i}</option>)
        }
        //this.setState((state) => {return {voices:arr}});
        //this.setState({state : this.state});
        //console.log("voices", this.state.voices);
        //console.log("English ", arr);
        //console.log("voiceOptionString", voiceOptionString);
        this.setState((state) => {return {voiceOptions : arr}});
        this.setState((state) => {return {voices : voices}});
        //while(this.state.voiceOptions !== arr){
        //    console.log("waiting...");
        //}
        //console.log("voiceOptions" + arr);
        return voiceOptionString; 
    }

    createFullVoiceList() {
        var arr = [];
        var voiceOptionString = "";
        let voices = window.speechSynthesis.getVoices();
        //console.log("voices = ", voices);
        for (let i = 0; i < voices.length; i++) {
            //console.log(voices[i].name, voices[i].lang);
            //if(voices[i].lang === 'en-US'){
                let name = voices[i].name;
                arr.push("<option key='"+name+"' value='"+name+"'>"+name+"</option>");
                voiceOptionString += "<option key='"+name+"' value='"+name+"'>"+name+"</option>";
            //}
            //arr.push(<option key={i} value="{i}">{i}</option>)
        }
        //this.setState((state) => {return {voices:arr}});
        //this.setState({state : this.state});
        //console.log("voices", this.state.voices);
        //console.log("English ", arr);
        //console.log("voiceOptionString", voiceOptionString);
        this.setState((state) => {return {voiceOptions : arr}});
        this.setState((state) => {return {voices : voices}});
        //while(this.state.voiceOptions !== arr){
        //    console.log("waiting...");
        //}
        //console.log("voiceOptions" + arr);
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
                    Select a Voice:
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
