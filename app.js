var express = require('express');
var path = require('path');
//ster do dtb, polaczenie
var mysql = require('mysql');
//komunikacja
var myConnection  = require('express-myconnection');

var app = express();
//z metody post 
app.use(express.urlencoded({ extended: true }))
//pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var dbOptions = {
	host: 'localhost',
	user: 'base',
	password: 'base',
	database: 'base'
	
}
//pool wyciaganie danych, dostep do bazy
app.use(myConnection(mysql, dbOptions, 'pool'));

app.get('/', function(req, res){
	
	res.render('start');
});

app.get('/list', function(req, res){
	//funcja wywoluje error i connection
	req.getConnection(function(error, conn){
		//zapytanie sql, funkcja anonimowa(error,dane)
		conn.query('SELECT * FROM meals',function(err,rows){
			//do listy przypiąć wartość
			var mealsList=rows;

			res.render('list',{
				mealsList:mealsList
			});

		});
	});
});

app.get('/add', function(req, res){
	res.render('add');
});

app.post('/add', function(req, res){
	var meal={
		nazwa: req.body.nazwa,
		alergen: req.body.alergen,
		kcal: req.body.kcal,
		prod: req.body.prod
	}
	//?, meal - obiekt z góry
	req.getConnection(function(error, conn){
		conn.query('INSERT INTO meals SET ?',meal,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały dodane';
			}
			res.render('add',{message:message});
		});
	});
});

app.get('/edit/(:id)', function(req, res){
	var idmeal=req.params.id;
	req.getConnection(function(error, conn){
		//pobieramy parametr z var u gory
		conn.query('SELECT * FROM meals WHERE id='+idmeal,function(err,rows){
			res.render('edit',{
				//bindujemy caly zestaw parametrów
				id: idmeal,
				//bierzemy pierwszy element
				nazwa: rows[0].nazwa,
				alergen: rows[0].alergen,
				kcal: rows[0].kcal,
				prod: rows[0].prod
			});
		});
	});
});
app.post('/edit/(:id)', function(req, res){
	var meal={
		nazwa: req.body.nazwa,
		alergen: req.body.alergen,
		kcal: req.body.kcal,
		prod: req.body.prod
	};
	req.getConnection(function(error, conn){
		conn.query('UPDATE meals SET ? WHERE id='+req.params.id,meal,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały zmienione';
			}
			res.render('edit',{
				id: req.params.id,
				nazwa: req.body.nazwa,
				alergen: req.body.alergen,
				kcal: req.body.kcal,
				prod: req.body.prod,
				message:message
			});
		});
	});
});
//('/delete/)(:id) - pierwszy delete jako nazwa sciezki a drugi to parametr przekazywany
app.get('/delete/(:id)', function(req, res){
	var idmeal=req.params.id;
	res.render('delete',{idmeal:idmeal});
});

app.post('/delete/(:id)', function(req, res){

	var idmeal=req.params.id;
	req.getConnection(function(error, conn){
		conn.query('DELETE FROM meals WHERE id='+idmeal,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały usunięte';
			}
			res.render('delete',{idmeal:idmeal,message:message});
		});
	});
});

app.listen(3011);