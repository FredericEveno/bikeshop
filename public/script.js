 // Create an instance of the Stripe object with your publishable API key
 var stripe = Stripe("pk_test_51IbjSyIgjuhlhdk3oTHTLzKn6GqnOx7ilIIV4VUAg2dRjGboPCe7fhsM5AryUwNQ2aFxDInb6H3wOhwp0RqJ6zpK00b0nNLW6Y");
 var checkoutButton = document.getElementById("checkout-button");
 console.log("??? : ", document.getElementById("checkout-button"));
 checkoutButton.addEventListener("click", function () {
   console.log("Bouton Checkout cliqué !");
   fetch("/create-checkout-session", {
     method: "POST",
   })
     .then(function (response) {
       return response.json();
     })
     .then(function (session) {
       return stripe.redirectToCheckout({ sessionId: session.id });
     })
     .then(function (result) {
       // If redirectToCheckout fails due to a browser or network
       // error, you should display the localized error message to your
       // customer using error.message.
       if (result.error) {
         alert(result.error.message);
       }
     })
     .catch(function (error) {
       console.error("Error:", error);
     });
 });