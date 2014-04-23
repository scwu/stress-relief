var homeView = {
  'config' : {
    'signin_button' : $('#signin-button'),
    'signin_field' : $('#email-add')
  },
  //init function
  'init' :  function(config) {
    if (config && typeof(config) == 'object') {
          $.extend(myFeature.config, config);
      }

      // create and/or cache some DOM elements
      // we'll want to use throughout the code
      homeView.$signin = homeView.config.signin_button;
      homeView.$email = homeView.config.signin_field;
     
      //initialize event listeners
      var login = homeView.signin(homeView.$signin, homeView.$email);

      // not useful, but just for testing
      homeView.initialized = true;
  },
  //event listener for typing
  'signin' : function($signin, $email) {
    // set event listener for button
    $signin.click(function(){
      homeView.sendRequest($email);
    });
  },
  'sendRequest' : function($email) {
    $.post( "/signin", { 'email' : $email.val() } )
      .done(function( data ) {
        location.reload();
    });
  }
}

var mainView = {
  'config' : {
    'add_button' : $('#stress-button'),
    'add_field' : $('#stress-add'),
    'stress_container' : $('#singleFrustration'),
    'response_field': $('#response-add'),
    'response_button' : $('#response-button')
  },
  //init function
  'init' :  function(config) {
    if (config && typeof(config) == 'object') {
          $.extend(myFeature.config, config);
      }

      // create and/or cache some DOM elements
      // we'll want to use throughout the code
      mainView.$add = mainView.config.add_button;
      mainView.$stress = mainView.config.add_field;
      mainView.$single = mainView.config.stress_container;
      mainView.$response_field = mainView.config.response_field;
      mainView.$response_btn = mainView.config.response_button;

      //initialize event listeners
      var add_weight = mainView.addStress(mainView.$add, mainView.$stress);
      var add_response = mainView.addResponse(mainView.$response_btn, mainView.$response_field);
      var initialize_single = mainView.initSingle(mainView.$single);
      // not useful, but just for testing
      mainView.initialized = true;
  },

  'initSingle' : function($single) {
    $single.empty();
    $.get( "/get_stress", function( data ) {
      if (Object.getOwnPropertyNames(data).length === 0) {
        $single.append('<p>Luckily, there are no more weights to carry.</p>');
      } else {
        $single.append('<p class="q" id="' + data.id + '">' + data.question + '</p>');
      }
    });
  },

  'addResponse' : function($add, $response) {
    $add.click(function(){
      mainView.sendResponseRequest($response);
      return false;
    });
  },
  //event listener for typing
  'addStress' : function($add, $stress) {
    // set event listener for button
    $add.click(function(){
      mainView.sendPostRequest($stress);
      return false;
    });
  },
  'sendResponseRequest' : function($response) {
    $.post( "/add_response", { 'response' : $response.val(), 'id':$('.q').attr('id') } )
      .success(function( data ) {
        mainView.initSingle(mainView.$single);
    });
  },
  'sendPostRequest' : function($stress) {
    $.post( "/add_post", { 'question' : $stress.val() } )
      .success(function( data ) {
        $('#addFrustration').modal('hide')
    });
  }
}
var mediumText = {
  //initialize frequently used containers
  'config' : {
    'text_container' : $('#text_editor'),
    'statistics' : $('#statistic')
  },

  //init function
  'init' :  function(config) {
    if (config && typeof(config) == 'object') {
          $.extend(myFeature.config, config);
      }

      // create and/or cache some DOM elements
      // we'll want to use throughout the code
      mediumText.$container = mediumText.config.text_container;
      mediumText.$stats = mediumText.config.statistics;
     
      //initialize statistics
      var stat_dict = mediumText.changeStats(mediumText.$container);

      // not useful, but just for testing
      mediumText.initialized = true;
  },

  //event listener for typing
  'changeStats' : function($text_container) {
    // set event listener for changing div
    $text_container.bind("DOMSubtreeModified", function(){
      mediumText.getStats($text_container);
    });
  },

  //calculating statistics
  'getStats' : function($text_container) {
    // get html so you can count paragraph breaks
    var full_text_html = $text_container.html();
    var paragraphs = {'paragraphs' : mediumText.getParagraphCount(full_text_html)};
   
    // get regular text to get full unigram
    var full_text = $text_container.text();
    var sentence_stats = mediumText.getSentenceStatistics(full_text); 
   
    var statistics = $.extend({}, sentence_stats, paragraphs);
    mediumText.setStats(mediumText.$stats, statistics);
  },

  // sometimes off by one on paragraph count
  'getParagraphCount' : function(html_text) {
    return html_text.split("<br>").length;
  },

  //get word count, sentence, bigram
  // TO DO : proper nouns -> verbs associated with them
  // Visualization of Distribution of words by length -> pie or bar chart
  'getSentenceStatistics' : function(full_text) {
    var sen_stats = {};
    var bigrams = {};
    var proper_nouns = {};
    var w_distr = {}
    var sentence_count = 0;

    // get text split on spaces (also tokenizing words)
    var words_list = full_text.split(" ");
    // get and assign word count
    sen_stats['words'] = words_list.length;

    var j = 0;
    for (var i = 0; i < words_list.length; i++) {

      //get last character of word and check if it's a period.
      if ($.trim(words_list[i]).slice(-1) === ".") {
        sentence_count++;
      }

      var w = mediumText.cleanString(words_list[i]);
      
      //get word length distribution
      if (w.length.toString() in w_distr) {
        w_distr[w.length.toString()]++;
      } else {
        w_distr[w.length.toString()] = 1;
      }

      
      // check if previous word even exists
      if (j > 0) {

        var full_proper = "";
        var cleaned = mediumText.cleanString(words_list[j]);
       
        //get full proper noun - like (Mount Everest)
        while (mediumText.isProperNoun(cleaned)) {
          //check to make sure j+1 is valid index
          if (j+1 <= words_list.length) {
            full_proper += " " + cleaned;
            cleaned = mediumText.cleanString(words_list[++j]);
          } else {
            break;
          }
        }
        
        //check for previous word to make sure isn't beginning of sentence
        if ((words_list[i-1].slice(-1) !== "." || full_proper in proper_nouns
            ) && full_proper !== "")  { //or if it already exist in the dictionary
          
          full_proper = $.trim(full_proper);

          //add to proper noun associative array
          if (full_proper in proper_nouns) {
            proper_nouns[full_proper]++;
          } else {
            proper_nouns[full_proper] = 1;
          }
        }
      }
      j++;

      // check if next word even exists
      if (i !== words_list.length - 1) {
        var w_next = mediumText.cleanString(words_list[i + 1]);
        var bigram = w.toLowerCase() + " " + w_next.toLowerCase();
        //maintain bigram associative array
        if (bigram in bigrams) {
          bigrams[bigram]++;
        } else {
          bigrams[bigram] = 1;
        }
      }

    }
    sen_stats['bigrams'] = mediumText.sortDictionary(bigrams);
    sen_stats['sentences'] = sentence_count;
    sen_stats['proper'] = mediumText.sortDictionary(proper_nouns);
    sen_stats['distribution'] = w_distr;
    return sen_stats;
  },

  'sortDictionary' :  function(dictionary) {
    var arr = []
    for (var key in dictionary) {
      if (dictionary.hasOwnProperty(key)) {
        arr.push({'name': key, 'value' : dictionary[key]});
      }
    }

    var sorted = arr.sort(function(a,b) {
      return b.value - a.value;
    });
    return sorted;
  },
  
  //returns string with no punctuation & trimmed
  'cleanString' : function(word) {
      //eliminate punctuation
      var no_punct = $.trim(word).replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,""); //remove punctuation
      var no_spaces = no_punct.replace(/\s{2,}/g," ");
      return no_spaces
  },

  'isProperNoun' : function(noun) { 
      if (noun.slice(0,1) !== noun.slice(0,1).toLowerCase() //make sure uppercase (not number either)
          && noun.length > 1) { //make sure not not 'I' or number 
            return true;
      }
  },

  'setStats' : function($stat_container, numbers) {
    $stat_container.find('#paragraph').children('#p_number').text(numbers['paragraphs']);
    $stat_container.find('#sentence').children('#s_number').text(numbers['sentences']);
    $stat_container.find('#word').children('#w_number').text(numbers['words']);
    $stat_container.find('#bigrams').children('ol').empty();
    $stat_container.find('#bigrams').children('ol').append(mediumText.generateListHTML(numbers['bigrams']));

    $stat_container.find('#proper').children('ol').empty();
    $stat_container.find('#proper').children('ol').append(mediumText.generateListHTML(numbers['proper']));
    mediumText.generateChartData(numbers['distribution']);

    // TO DO : set bigrams and sort in order before finishing (create ordered list for them)
  },

  'generateListHTML' : function(arr) {
    html_list = [];
    for (var i = 0; i < arr.length; i++) {
      var name = arr[i]['name'];
      var value = arr[i]['value'];
      var html_s = '<li>' + name + ": " + value + '</li>';
      html_list.push(html_s);
    }
    return html_list.join("");

  },

  'generateChartData' : function(distri) {
    var keys = Object.keys(distri)
    var sorted = keys.sort();
    var value_ordered = [];
    for (var i =0; i < sorted.length; i++) { 
      value_ordered.push(distri[sorted[i]]);
    }
    console.log(sorted);
    console.log(value_ordered);
    var data = {
	    labels : sorted,
	    datasets : [
		  {
        fillColor : "rgba(220,220,220,0.5)",
        strokeColor : "rgba(220,220,220,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        data : value_ordered
      }]
    };
    var ctx = $("#myChart").get(0).getContext("2d");
    var newChart = new Chart(ctx).Line(data);
  }
}

