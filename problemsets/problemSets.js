var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/education');
var users = require('../util/users');
var collection_ps = db.get('ps');
var collection_questions = db.get('questions');

var current_course = 'cse115-s18';

var collection_entry_example =
{
	'username': 'hartloff',
	'lab_section': 'B3',
	'id': 1232313123, // For card swipe
	'section_id': 123455, // Unique id matching AutoLab section
	'current_ps': {},
	'current_ps_finished': false,
	'all_ps_assigned': {}, // keyed by ps_number
	'all_ps_results': {}, // keyed by ps_number

	'levels': {},
	'xp': {},
	'lab_stuff': "? we'll get there. Worst case, manually checked/verified. Maybe only checked on card swipe.."
};

var ps_example =
{
	'assigned_username': 'hartloff',
	'ps_number': 4,
	'concept': 'algos2',
	//'submitted': true,
	'questions': [
		{}, {}, {}, {}, {}
	],
	'bonus_multiplier': 2,
	'time_generated': 2,
	'time_completed': 3
};

var ps_results_example =
{
	//'assigned_username': 'hartloff',
	//'ps_number': 4,
	//'concept': 'algos2',
	//'submitted': true,
	'questions': [
		{'number': "q1", 'correct': true, 'feedback': "good job"}
		//{'type': 4, 'variant': 521, 'correct': true, "feedback": "good job"},
		//{'type': 2, 'variant': 19, 'correct': true, "feedback": "good job"},
		//{'type': 1, 'variant': 823, 'correct': true, "feedback": "good job"},
		//{'type': 5, 'variant': 79, 'correct': true, "feedback": "good job"},
		//{'type': 3, 'variant': 372, 'correct': true, "feedback": "good job"}
	]
}; // -or- {'submitted': false}

var question_example =
{
	"concept": "algos1",
	"type": 2,
	"variant": 42,
	"instruction_text": "Write a method that takes an ArrayList of Integers as its only parameter and outputs the " +
	"average of all the values as a double",
	"cards": []
};


var card_example = "Link to lecture content and videos";

function instructions_to_javadoc(instructions, width, indent) {
	if (!width) {
		width = 120;
	}
	if (!indent) {
		indent = "    "
	}

	var docs = indent + "/**\n";

	docs += indent + " * " + instructions;

	// TODO: Instructions at char max
	// look through keeping track of last space seen
	// when char+max hits, add a "\n     * " after last seen space
	// reset counter and add "     * " at \n in instructions

	docs += indent + " */\n";
	return docs;
}

function java_class_name(problem_set) {
	var number = problem_set.ps_number.toString();
	for (var i = 0; i < 4 - number.length; i++) {
		number = '0' + number;
	}
	return "ProblemSet_" + problem_set.assigned_username + "_" + number;
}

function build_ps_text(problem_set) {
	var ps = "";
	ps += "public class " + java_class_name(problem_set) + "{\n";
	ps += "    \n";
	ps += "    \n";

	var question_number = 1;
	for (var i in problem_set.questions) {
		var instructions = problem_set.questions[i].instruction_text;

		ps += instructions_to_javadoc(instructions);
		ps += "    public static void q" + question_number.toString() + "(){\n";
		ps += "    \n";
		ps += "        /* your code for question " + question_number.toString() + " goes here */\n";
		ps += "    \n";
		ps += "    }\n";
		ps += "\n";
		ps += "\n";

		question_number++;
	}

	ps += "    public static void main(String[] args){\n";
	ps += "        \n";
	ps += "        /* Test your code here to verify it is correct before submitting */\n";
	ps += "        \n";
	ps += "    }\n";
	ps += "}\n";

	return ps;
}


// entry point
exports.get_ps = function get_ps(req, res, course) {
	if (!req.user) {
		res.render('questions/ps', res.to_template);
	} else {
		collection_ps.findOne({"username": req.user.username}, {}, function (err, user_ps) {
			if (err) {
				console.log("database error in get_ps: " + err);
				req.flash("error", "Database error 1");
				res.render('questions/ps', res.to_template);
			} else if (!user_ps) {
				console.log("user not enrolled for problem sets: " + req.user.username);
				req.flash("error", "User " + req.user.username + " is not registered for this feature. If you are enrolled in CSE115 send and email to hartloff@buffalo.edu with the subject \"CSE115 Problem Set Registration\" immediately to unlock problem sets");
				res.render('questions/ps', res.to_template);
			} else {
				res.to_template.current_problem_set_number = 3;
				// TODO: get proper ps number
				// TODO: grab feedback, result, XP, level, progress to next lab/homework
				res.render('questions/ps', res.to_template);
			}
		});
	}
};


question_example =
{
	"concept": "algos1",
	"type": 2,
	"variant": 42,
	"instruction_text": "Write a method that takes an ArrayList of Integers as its only parameter and outputs the " +
	"average of all the values as a double",
	"cards": []
};

function get_random_question(concept, type) {
	return {
		"concept": "algos1",
		"type": 2,
		"variant": 42,
		"instruction_text": "Write a method that takes an ArrayList of Integers as its only parameter and outputs the " +
		"average of all the values as a double: " + random_section_id(),
		"cards": []
	};
}

function generate_new_ps(req, res, user_ps, next) {

	console.log(user_ps);
	// TODO: get random questions based on XP/Level/Lab/HW
	var new_ps_number = user_ps.current_ps.ps_number + 1;
	var current_concept = "algos2";
	var question_types_remaining = [2, 3, 4, 5];
	var bonus_multiplier = 1;
	var ps =
	{
		'assigned_username': req.user.username,
		'ps_number': new_ps_number,
		'concept': current_concept,
		'submitted': false,
		'bonus_multiplier': bonus_multiplier,
		'time_generated': Date.now()
	};

	var questions = [];
	questions.push(get_random_question());
	questions.push(get_random_question());
	questions.push(get_random_question());
	questions.push(get_random_question());
	questions.push(get_random_question());

	ps['questions'] = questions;
	// TODO: set the new ps as the current_ps
	// TODO: add new ps to all_ps
	// TODO: Increment ps number

	var toSet = {
		current_ps_finished: false,
		current_ps: ps,
		all_ps_assigned: {}
	};

	toSet['all_ps_assigned'][new_ps_number] = ps;
	user_ps.current_ps = ps;

	console.log("toSet");
	console.log(toSet);

	collection_ps.update({username: req.user.username}, {
		$set: toSet
	}, function (err) {
		next(req, res, user_ps);
	});
}


function send_current_ps(req, res, user_ps) {
	var ps = user_ps.current_ps;
	res.setHeader('Content-disposition', 'attachment; filename=' + java_class_name(ps) + '.java');
	console.log("sending ps " + ps.ps_number + " to: " + req.user.username);
	res.send(build_ps_text(ps));
}

exports.ps_download = function ps_download(req, res, course) {
	console.log("ps_download");
	console.log(req.user.username);

	if (!req.user) {
		res.render('questions/ps', res.to_template);
	} else {
		collection_ps.findOne({"username": req.user.username}, {}, function (err, user_ps) {
			if (err) {
				console.log("database error in ps_download: " + err);
				req.flash("error", "Database error 1");
				res.render('questions/ps', res.to_template);
			} else if (!user_ps) {
				console.log("user not enrolled for problem sets: " + req.user.username);
				req.flash("error", "User " + req.user.username + " is not registered for this feature. If you are enrolled in CSE115 send and email to hartloff@buffalo.edu with the subject \"CSE115 Problem Set Registration\" immediately to unlock problem sets");
				res.render('questions/ps', res.to_template);
			} else {
				if (user_ps.current_ps_finished) {
					//send_current_ps(req, res, user_ps);
					generate_new_ps(req, res, user_ps, send_current_ps);
				} else {
					send_current_ps(req, res, user_ps);
				}
			}
		});
	}

};

//exports.ps_download_new = function ps_download_new(req, res, course) {
//	// TODO: Do not allow unless current PS has been graded! Must complete a gameplay loop before starting the next one
//	// TODO generate new PS
//	res.setHeader('Content-disposition', 'attachment; filename=ProblemSet_hartloff_0001.java');
//	console.log(__dirname);
//	res.send("\npublic class ProblemSet_hartloff_0001{\n\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"Hello world!\");\n\t}\n}\n\n");
//};
//
//exports.ps_download_current = function ps_download_current(req, res, course) {
//	// TODO: build and send current PS
//	res.setHeader('Content-disposition', 'attachment; filename=ProblemSet_hartloff_0001.java');
//	console.log(__dirname);
//	res.send("\npublic class ProblemSet_hartloff_0001{\n\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"Hello world!\");\n\t}\n}\n\n");
//};

exports.ps_api = function ps_api(req, res, course) {
	if (req.body.key !== "super_secret_key") {
		// TODO: better keys
		res.send("nope");
	} else if (!req.userAgent) {
		// TODO
		res.send("nah");
	} else if (req.body.request_type === "get_current_ps") {
		api_get_current_ps(req, res, course);
	} else if (req.body.request_type === "send_ps_results") {
		api_send_ps_results(req, res, course);
	} else {
		res.send("bad request type: " + req.body.request_type);
	}
};

function api_get_current_ps(req, res, course) {
	var section_id = req.body.section_id;

	collection_ps.findOne({"section_id": section_id}, {}, function (err, record) {
		if (err) {
			console.log("database error in api_get_current_ps: " + err);
			res.send("database error");
		} else if (!record) {
			res.send("No user found with section_id " + section_id);
		} else {
			res.send(JSON.stringify(record.current_ps))
		}
	});
}

function api_send_ps_results(req, res, course) {
	var section_id = req.body.section_id;
	var results = req.body.results;

	collection_ps.findOne({"section_id": section_id}, {}, function (err, record) {
		if (err) {
			console.log("database error in api_send_ps_results: " + err);
			res.send("database error");
		} else if (!record) {
			res.send("No user found with section_id " + section_id);
		} else if (record.current_ps_finished) {
			console.log("Resubmission for no credit. section_id= " + section_id + " problem set=" + record.ps_current.ps_number);
			// TODO: Mark some feedback to show this no credit submission to the user with a note
			res.send("This problem set has already been submitted for credit. This submission will not count towards course progress.");
		} else {

			var toSet = {};
			toSet["current_ps_finished"] = true;
			toSet["ps_results"][record.current_ps.ps_number] = results;
			// TODO: 'time_completed': Date.now()

			collection_ps.update(
				{"section_id": section_id},
				{
					$set: toSet
				}, function (err) {
					if (err) {
						console.log("database error in api_get_current_ps update: " + err);
						res.send("database error");
					} else {
						// TODO process the results and add up XP, prepare for next PS
						res.send("success");
					}
				});

			res.send("success");
		}
	});


// Send PS results and feedback by section_id

}


// Off-line Functions //

function add_ps_user(username, lab_section, number_id, section_id, next) {
	collection_ps.findOne({"username": username}, {}, function (err, record) {
		if (err) {
			console.log("database error while adding " + username + ": " + err);
		} else if (record) {
			console.log("user " + username + " already in the database");
		} else {
			var collection_entry_example =
			{
				'username': username,
				'lab_section': lab_section,
				'id': number_id, // For card swipe
				'section_id': section_id, // Unique id matching AutoLab section
				'current_ps': {
					'assigned_username': username,
					'ps_number': 0,
					'concept': 'null',
					//'submitted': true,
					'questions': [
						//{},{},{},{},{}
					]
				},
				'current_ps_finished': true,
				'all_ps_assigned': {}, // keyed by ps_number
				'all_ps_results': {}, // keyed by ps_number

				'levels': {},
				'xp': {},
				'labs': {},
				'homework': {},
				'extra': {},
				'extra_text': ""
			};
			collection_ps.insert(collection_entry_example, next());
		}
	});
}

function random_section_id(token_length) {
	var length = token_length || 10;
	var alphabet = '012356789';
	var token = '';
	for (var i = 0; i < length; i++) {
		token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return token;
}
// function set_user_section_id(username, section_id){}

// function set_user_lab_section(username, lab_section){}
// function set_user_number_id(username, section_id){}

//add_ps_user("sophie", "A1", "11111111", "1234567890", function(){console.log("user added");});

//console.log(Date.now());