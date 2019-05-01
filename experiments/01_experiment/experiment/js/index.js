function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions0 = slide({
    name : "instructions0",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });
  slides.instructions1 = slide({
    name : "instructions1",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });
  slides.instructions2 = slide({
    name : "instructions2",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });
  slides.instructions3 = slide({
    name : "instructions3",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.one_slider = slide({
    name : "one_slider",

    /* trial information for this block
     (the variable 'stim' will change between each of these values,
      and for each of these, present_handle will be run.) */
    present : exp.all_stims,

    //this gets run only at the beginning of the block
    present_handle : function(stim) {
      $(".err").hide();

      this.stim = stim; //I like to store this information in the slide so I can record it later.

      // Get audio files
      $("#audio_src_ogg").attr("src", 'audio/'+ stim.filename + '.ogg');
      $("#audio_src_wav").attr("src", 'audio/'+ stim.filename + '.wav');
      this.init_sliders();
      exp.sliderPost = null; //erase current slider value
    },

    button : function() {
      if (exp.sliderPost == null) {
        $(".err").show();
      } else {
        this.log_responses();

        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
      }
    },

    init_sliders : function() {
      utils.make_slider("#single_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },

    log_responses : function() {
      exp.data_trials.push({
        "trial_type" : "one_slider",
        "filename" : this.stim.filename,
        "fac1" : this.stim.fac1,
        "fac2" : this.stim.fac2,
        "measured_sync" : exp.sliderPost
      });
    }
  });

  slides.background_info = slide({
    name : "background_info",
    continue : function(){
      exp.background_data = {
        // How often do you listen
        listenfreq : $("#listenfreq").val(),
        // What kind of music do you listen to
        listentype : $("#listentype").val(),
        // Do you play an instrument
        doesplay : $("#doesplay").val(),
        // If so, how many
        instnum : $("#instnum").val(),
        // What instrument(s) do you play
        instname : $("#instname").val(),
        // How long have you played
        playtime : $("#playtime").val(),
        // How often do you practice
        practime : $("#practime").val(),
        // How often do you perform
        perftime : $("#perftime").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        // Primary language
        language : $("#language").val(),
        // How fun was the hit
        enjoyment : $("#enjoyment").val(),
        // Did you do the hit right
        assess : $('input[name="assess"]:checked').val(),
        // Age
        age : $("#age").val(),
        // Gender
        gender : $("#gender").val(),
        // Education level
        education : $("#education").val(),
        // Any other comments
        comments : $("#comments").val(),
        // Any problems with the hit
        problems: $("#problems").val(),
        // What would be a fair price for the hit
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          // "condition" : exp.condition,
          "background_information" : exp.background_data,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  // Set stimulus list
  exp.all_stims = [];
  exp.audio_stims = _.shuffle(audio);
  exp.simple_stims = _.shuffle(simple_audio);
  exp.trials = [];
  exp.catch_trials = [];
  // I'm not using between subjects conditions at all
  // exp.condition = _.sample(["condition 1", "condition 2"]); //can randomize between subject conditions here
  // Loop through all stimuli, add attention check low-syncopation rhythms at regular intervals
  var stim_index = 0;
  var simple_index = 0;
  var block_size = 3;
  var total_length = exp.audio_stims.length + exp.simple_stims.length;
  for (j = 0; j < total_length; j++) {
    // Check for location modulo XXXXX
    if ((j+1) % block_size == 0) {
      // If mod XXXXX == 0, insert low-syncopation rhythm
      exp.all_stims.push(exp.simple_stims[simple_index]);
      simple_index++;
    }
    else {
      // Else, insert current stimulus
      exp.all_stims.push(exp.audio_stims[stim_index]);
      stim_index++;
    }
  }
  console.log(exp.all_stims);
  
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["i0", "instructions0", "instructions1", "instructions2", "instructions3", "one_slider", "background_info", "subj_info", "thanks"];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  //exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  $("#audio_player").bind("ended", function () {
    $("#continue_button").show();
    $("#slider_table").show();
  });

  exp.go(); //show first slide
}
