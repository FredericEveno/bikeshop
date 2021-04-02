
const stripe = require('stripe')('sk_test_51IbjSyIgjuhlhdk3CeXdD7wUwzWFMHzcWO3PyudMyInsBvVyIWTb8jdlpGAuWwcn9nVWzmkXeHCu53f7GpFKnv9e00x7f5NbJZ');
var express = require('express');
var router = express.Router();
const ROOT = 'http://localhost:3000';

var dataBike = [
  {name:"BIKO45", url:"/images/bike-1.jpg", price:679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869},
]

function getElementByName (tab, str) {
  console.log("tab : ", tab);
  for(var i=0; i<tab.length; i++) {
    if(tab[i].name === str) {
      return tab[i];
    };
  }
};

function generateUrl (url) {
  var completeUrl
}

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("/ req.query : ", req.query);
  console.log("/ req.session.dataCardBike : ", req.session.dataCardBike);
  if(req.session.dataCardBike !== undefined) {
    console.log("### Card is not empty ###");
  } else {
    req.session.dataCardBike = [];
  }
  res.render( 'index', {dataBike:dataBike, dataCardBike:req.session.dataCardBike} );
});

router.get('/shop', function(req, res, next) {
  console.log("req query : ", req.query);
  console.log("req.session.dataCardBike : ", req.session.dataCardBike);

  if(!req.query.name) {
    res.render( 'shop', {dataCardBike:req.session.dataCardBike} );
    return;
  } /* si name est vide, on stope l'execution du code, c'est ce que fait le return; */
  /* ceci évite que le panier */

  var objectToPush = getElementByName(dataBike, req.query.name);
  var objectToTest = getElementByName(req.session.dataCardBike, req.query.name);

  if(req.session.dataCardBike.includes(objectToTest)) {
    req.session.dataCardBike[req.session.dataCardBike.indexOf(objectToTest)].quantity ++;
  } else {
  req.session.dataCardBike.push({
    name: objectToPush.name,
    url: objectToPush.url,
    price: objectToPush.price,
    quantity: 1
  });
  }
  // res.render( 'shop', {dataCardBike:req.session.dataCardBike} );
  res.redirect( '/shop');
  /* Une fois que le panier est chargé on redirige sur /shop pour que les paramètres
  n'apparaissent plus dans l'URL. Ceci évite qu'au refresh le produit s'ajoute à nouveau 
  dans le panier parce que le paramètre serait à nouveau lu par le serveur.
  En faisant cela, lorsque ce code s'exécute on remonte directement en haut et on exécute à 
  nouveau le code, en repassant par la condition if(!req.query.name) {.... qui cette fois-ci
  sera fausse, on on res.render avec les bons params et on stoppe avec le return;  */
});

router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.position, 1);
  res.render( 'shop', {dataCardBike:req.session.dataCardBike} );
});

router.post("/update-shop", function(req, res) {
  req.session.dataCardBike[req.body.position].quantity = req.body.quantity;
  res.render( "shop", {dataCardBike:req.session.dataCardBike} );
});

router.post('/create-checkout-session', async (req, res) => {
  console.log(req.body);
  console.log("req.session.dataCardBike : ", req.session.dataCardBike);
  var virtualBasket = [];
  for(var i=0; i<req.session.dataCardBike.length; i++) {
    virtualBasket.push(
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.dataCardBike[i].name,
            images: [`${ROOT}/${req.session.dataCardBike[i].url}`],
          },
          unit_amount: 100*req.session.dataCardBike[i].price,
        },
        quantity: req.session.dataCardBike[i].quantity,
      }
    )
  }
  console.log("virtualBasket : ", virtualBasket);
  console.log("virtualBasket product images : ", virtualBasket[0].price_data.product_data.images);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: virtualBasket,
    mode: 'payment',
    success_url: `${ROOT}/success`,
    cancel_url: `${ROOT}/`,
  });
  res.json({ id: session.id });
});

router.get('/success', function(req, res, next) {
  console.log(req.query);
  res.render( 'confirm' , {});
});

module.exports = router;
