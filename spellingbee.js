      body {
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        flex-direction: column;
      }

      .info{
        font-weight: bold;
        color: #009900;
      }

      .basicbutton
      {
        margin-top:4px;
        display: inline;
        background-color: #eeee99;
        border: 1px solid #666666;
        padding: 2px;
        border-radius: 3px;
        border-color: #000000;
        transition: box-shadow .3s;
      }
      .basicbutton:hover
      {
        box-shadow: #222222 0 0 0 2px, rgba(255, 255, 255, 0.8) 0 0 0 4px;
        background-color: #ffffcc;
        
      }

      button {
        display: inline;
        background-color: #eeee99;
        border: 1px solid #666666;
        padding: 4px;
        border-radius: 3px;
        transition: box-shadow .3s;
      }

      button:hover{
        box-shadow: #222222 0 0 0 2px, rgba(255, 255, 255, 0.8) 0 0 0 4px;
        background-color: #ffffcc;
      }
      
      button:active {
        background-color: #ffffcc;
        border-color: #000000;
        transform: scale(.96);
      }
      
      button:disabled {
        border-color: #DDDDDD;
        color: #DDDDDD;
        cursor: not-allowed;
        opacity: 1;
      }
      .genericform {
        display: grid;
        gap: 4px;
        grid-template-columns: 30% 70%;
        width:100%;
      }
      
      .genericformelementlabel {
         text-align: right	;
      }
      .genericformelementinput {
         text-align: left;
        width: 100px;
      }
      
      .genericformerror {
        font-size: 10px;
        color: red;
      }
      
      .generalerror {
        color: red;
      }

      .userform{
        text-align:right;
      }
      
      #message {
        display:block;
        position:absolute;
        top: 33px;
        left: 30px;
        border: 1px solid #000000;
        font-size: 20px;
        font-weight: bold;
        font-family: Arial, sans-serif;
        border-radius: 6px;
        display: none;
        z-index:90;
      }
      .panagram{
        font-weight: bold;
        color: red;
      }
      
      .centered-div {
        margin: 20px 0;
        text-align: center;
        font-size: 20px;
        font-family: Arial, sans-serif;
      }

      #login {
        position: absolute;
        top:0px;
        left:550px;
        width: 300px;
        font-size:12px;
        z-index: 12;
        background-color: #ffffee;
        border: 1px solid  #000000;
        border-radius: 5px;
      }
      #levellist {
        position: absolute;
        top:120px;
        left:550px;
        width: 100px;
        font-size:12px;
        z-index: 10;
        text-align: left;
      }

      #stats {
        position: absolute;
        top: 290px;
        left:550px;
        width: 100px;
        font-size:12px;
        z-index: 10;
        text-align: left;
      }
      .header{
        font-size:14px;
        font-weight: bold;
        padding-top:5px;
      }

      #foundwordslabel{
        position: absolute;
        top:10px;
        left:340px;
        font-size:14px;
      }
      #foundwords{

      }
      #foundwords1{
        position: absolute;
        top:50px;
        left:340px;
        width:70px;
        font-size:11px;
        justify-content: left;
        border:1px solid #999999;
        border-radius: 6px;
        text-align: left;
        padding: 4px;
      }
      #foundwords2{
        position: absolute;
        top:50px;
        left:430px;
        width:70px;
        font-size:11px;
        justify-content: left;
        border:1px solid #999999;
        border-radius: 6px;
        text-align: left;
        padding: 4px;
      }
      #config{
        position: absolute;
        top:25px;
        left:340px;
        font-size:12px;
      }

      #currentword{
        display: none;
        font-size:20px;
        position: absolute;
        top: 60px;
        left: 100px;
        justify-content: center;
        border:1px solid #999999
        display: none;
      }

      #score{
        font-size:20px;
        position: absolute;
        top: 5px;
        left: 30px;
        justify-content: center;
        background-color:#ffffee;
        border-radius: 5px;
        display: none;
      }

      #others {
        position: absolute;
        width: 300px;
        height: 300px;
        display: block;
        top: 500px;
        left: 0px;
      }

      #communicationmessage {
        position: absolute;
        width: 300px;
        height: 250px;
        display: block;
        top: 0px;
        left: 550px;
        display: none;
        background-color: #eeeeee;
        z-index:100;
        border: 1px solid #000000;
        border-radius: 6px;
      }
      
      .messagetext{
        padding-bottom: 4px;
        font-size: 13px;
        padding: 6px;
        background-color:#ffffff;
        border-radius: 6px;
        text-align: right;
      }

      .messageheader{
        font-weight: bold;
        font-size: 11px;
        text-align:left;
      }

      .messagetimedescription{
        font-weight: normal;
        color: #666666;
      }

      #receivedmessage{
        width: 280px;
        height: 100px;
        font-size: 11px;
        text-align:left;
        padding: 3px;
      }
      
      .otherscorestable{
        border-collapse: collapse;
        border: 1px solid  #cccccc;
        width:500px;

      }
      table, th, td {
        border: 1px solid;
        border-collapse: collapse;
        border: 1px solid #cccccc;
      }
      .otherscoresheader{
        font-size:11px;
        font-weight: bold;

      }
      .otherscores{
        font-size:10px;

      }
      td.otherscores{
        font-size:10px;

      }
      .buttons{
        position: absolute;
        margin-top: 20px;
        top: 400px;
        left: 90px;
        justify-content: center;
      
      }

      a:link{
        text-decoration:none;
        color: #000000;
      }
      
      a:visited{
        text-decoration:none;
        color: #000000;
      }

      #hexagon-container {
        position: absolute;
        width: 300px;
        height: 300px;
        display: block;
        top: 100px;
        left: 0px;
      }
      .hexagon {
        position: absolute;
        width: 110px;
        height: 110px;
        background-color: #eeee99;
        clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        font-size: 20px;
        font-weight: bold;
        font-family: Arial, sans-serif;
        cursor: pointer;
        
      }
      

      .hexagon:before,
      .hexagon:after {
          content: "";
          position: absolute;
          width: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
      }

      .hexagon:before {
          bottom: 100%;
          border-bottom: 23.09px solid #64C7CC;
      }

      .hexagon:after {
          top: 100%;
          width: 0;
          border-top: 23.09px solid #64C7CC;
      }

      .hexagon:nth-child(1) { top: 0; left: 120px; }
      .hexagon:nth-child(2) { top: 50px; left: 210px; }
      .hexagon:nth-child(3) { top: 150px; left: 210px; }
      .hexagon:nth-child(4) { top: 200px; left: 120px; }
      .hexagon:nth-child(5) { top: 150px; left: 30px; }
      .hexagon:nth-child(6) { top: 50px; left: 30px; }
      .hexagon:nth-child(7) { top: 100px; left: 120px; }
