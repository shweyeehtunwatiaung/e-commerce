import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { commerce } from "./lib/commerce";
import { Products, Navbar, Cart, Checkout } from "./components";

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [order, setOrder]= useState({});
  const [errorMessage, setErrorMessage]= useState('');

  const fetchProducts = async () => {
    await fetch("https://api.chec.io/v1/products", {
      method: "GET",
      headers: {
        "x-authorization": process.env.REACT_APP_CHEC_PUBLIC_KEY, // token API
      },
    })
      .then((res) => res.json())
      .then((payload) => {
        setProducts(payload.data);
      });

    // const { data } = await commerce.products.list();
    // setProducts(data);
  };

  const fetchCart = async () => {
    const cart = await commerce.cart.retrieve();
    setCart(cart);
  };

  const handleAddToCart = async (productId, quantity) => {
    const response = await commerce.cart.add(productId, quantity);
    setCart(response.cart);
  };

  const handleUpdateCartQty = async (productId, quantity) => {
    const response = await commerce.cart.update(productId, { quantity });
    setCart(response.cart);
  };

  const handleRemoveFromCart = async (productId) => {

    const response = await commerce.cart.remove(productId);
    setCart(response.cart);
  };

  const handleEmptyCart = async () => {
    const response = await commerce.cart.empty();
    setCart(response.cart);
  };

  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();

    setCart(newCart);
  };
  
  const handleCaptureCheckout = async(checkoutTokenId,newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(checkoutTokenId,newOrder)
      setOrder(incomingOrder)
      handleEmptyCart()
    } catch (error) {
      setErrorMessage(error.data.error.message)
    }
  }

 
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  return (
    <Router>
      <div>
        <Navbar totalItems={cart.total_items} />
      </div>
      <Switch>
        <Route exact path="/">
          <Products products={products} onAddToCart={handleAddToCart} />
        </Route>

        <Route exact path="/cart">
          <Cart
            cart={cart}
            handleUpdateCartQty={handleUpdateCartQty}
            handleRemoveFromCart={handleRemoveFromCart}
            handleEmptyCart={handleEmptyCart}
          />
        </Route>
        <Route exact path="/checkout">
          <Checkout 
          cart={cart}
          order={order}
          onCaptureCheckout={handleCaptureCheckout}
          error={errorMessage}
          />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
