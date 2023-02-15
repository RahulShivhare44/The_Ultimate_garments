import React, { useEffect, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import { useDispatch,useSelector } from "react-redux";
import { ServerURL,postData } from "../Services/NodeServices";
import { useNavigate } from "react-router";
import { css } from "@emotion/react";
import SyncLoader from "react-spinners/SyncLoader";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
const styles = (theme) => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
  },
  icon: {
    margin: theme.spacing.unit,
    fontSize: 32,
  },
  margin: {
    marginRight: "80%",
    paddingLeft: "",
  },
  button: {
    margin: theme.spacing.unit,
  },

  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
});

const PaymentGateway = (props) => {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#36D7B7");
  var navigate=useNavigate()
  var dispatch=useDispatch()
  var user = useSelector(state => state.user)
  var userData = Object.values(user)[0]
  var cart = useSelector(state => state.cart)
  var values = Object.values(cart)

  const totalPayableAmount = (a, b) => {
    var price = 0
    if (b.offerprice > 0)
      price = b.offerprice * b.qty
    else
      price = b.price * b.qty
    return a + price
  }

  const actualAmount = (a, b) => {
    return a + b.price * b.qty
  }


  var tpay = values.reduce(totalPayableAmount, 0)
  var aamt = values.reduce(actualAmount, 0)
  var na = aamt - tpay

  const options = {
    key: "rzp_test_GQ6XaPC6gMPNwH",
    amount: na * 100, //  = INR 1
    name: "TheUltimateGarments.com",
    // description: 'some description',
    image:
      `${ServerURL}/images/logo.png`,
    handler: async function (response) {

      alert(response.razorpay_payment_id)
      var result = await postData('userinterface/submit_orders', { userid: userData.mobilenumber, mobilenumber: userData.mobilenumber, emailid: userData.emailid, orderdate: new Date(),products:cart})
      if (result.status) { 
        alert("Order Submitted...!")
        dispatch({type:'EMPTY_CART',payload:[]})
        window.location.href='http://localhost:3000/home' 
      }
      else { 
        alert('fail to submit order') 
      }
    },
    prefill: {
      name: userData.firstname + " " + userData.lastname,
      contact: userData.mobilenumber,
      email: userData.emailid
    },
    notes: {
      address: "some address",
    },
    theme: {
      color: '#51cccc',
      hide_topbar: false,
    },
  };


  const gotoRazorpay = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

        <div style={{ fontSize: 30, fontWeight: 'bold', color: 'GrayText', padding: 20 }}>Redirecting to Razorpay pls wait........</div>

        <div className="sweet-loading">

          <SyncLoader color={color} loading={loading} css={override} size={25} />
          {openPayModal()}
        </div>
      </div>
    )
  }

  const openPayModal = async () => {
    var rzp1 = new window.Razorpay(options);
    await rzp1.open()
    setLoading(!loading)
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { classes } = props;

  return (
    <>

      {gotoRazorpay()}

    </>
  );
};

export default withStyles(styles)(PaymentGateway);
