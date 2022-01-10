import React, { Component } from 'react';
import { Paper, Alert, AlertTitle, Button , Grid, Typography, TextField, Select, FormHelperText, MenuItem, FormControl, Radio, FormControlLabel, RadioGroup, Menu} from "@mui/material"
import { Link } from 'react-router-dom'

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// pretty numbers
function pn(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

export default class MakerPage extends Component {
  defaultCurrency = 1;
  defaultCurrencyCode = 'USD';
  defaultPaymentMethod = "not specified";
  defaultPremium = 0;
  minTradeSats = 10000;
  maxTradeSats = 500000;

  constructor(props) {
    super(props);
    this.state={
        isExplicit: false, 
        type: 0,
        currency: this.defaultCurrency,
        currencyCode: this.defaultCurrencyCode,
        payment_method: this.defaultPaymentMethod,
        premium: 0,
        satoshis: null,
        currencies_dict: {"1":"USD"}
    }
    this.getCurrencyDict()
  }

  handleTypeChange=(e)=>{
      this.setState({
          type: e.target.value,     
      });
  }
  handleCurrencyChange=(e)=>{
    this.setState({
        currency: e.target.value,
        currencyCode: this.getCurrencyCode(e.target.value),
    });
}
    handleAmountChange=(e)=>{
        this.setState({
            amount: e.target.value,     
        });
    }
    handlePaymentMethodChange=(e)=>{
        this.setState({
            payment_method: e.target.value,     
        });
    }
    handlePremiumChange=(e)=>{
        this.setState({
            premium: e.target.value,     
        });
    }
    handleSatoshisChange=(e)=>{
        var bad_sats = e.target.value > this.maxTradeSats ? 
            ("Must be less than "+pn(this.maxTradeSats)): 
            (e.target.value < this.minTradeSats ? 
            ("Must be more than "+pn(this.minTradeSats)): null)

        this.setState({
            satoshis: e.target.value,
            badSatoshis: bad_sats,      
        })
        ;
    }
    handleClickRelative=(e)=>{
        this.setState({
            isExplicit: false, 
            satoshis: null,
            premium: 0,     
        });
    }
    handleClickExplicit=(e)=>{
        this.setState({
            isExplicit: true,
            premium: null,     
        });
    }

    handleCreateOfferButtonPressed=()=>{
        this.state.amount == null ? this.setState({amount: 0}) : null;

        console.log(this.state)
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type':'application/json', 'X-CSRFToken': getCookie('csrftoken')},
            body: JSON.stringify({
                type: this.state.type,
                currency: this.state.currency,
                amount: this.state.amount,
                payment_method: this.state.payment_method,
                is_explicit: this.state.isExplicit,
                premium: this.state.premium,
                satoshis: this.state.satoshis,
            }),
        };
        fetch("/api/make/",requestOptions)
        .then((response) => response.json())
        .then((data) => (this.setState({badRequest:data.bad_request})
             & (data.id ? this.props.history.push('/order/' + data.id) :"")));
    }

    getCurrencyDict() {
        fetch('/static/assets/currencies.json')
          .then((response) => response.json())
          .then((data) => 
          this.setState({
            currencies_dict: data
          }));
    
      }

    getCurrencyCode(val){
        return this.state.currencies_dict[val.toString()]
    }

  render() {
    return (
            <Grid container xs={12} align="center" spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h2" variant="h2">
                        Order Maker
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center" spacing={1}>
                <Paper elevation={12} style={{ padding: 8, width:350, align:'center'}}>
                    <Grid item xs={12} align="center" spacing={1}>
                    <FormControl component="fieldset">
                        <FormHelperText>
                            Buy or Sell Bitcoin?
                        </FormHelperText>
                        <RadioGroup row defaultValue="0" onChange={this.handleTypeChange}>
                            <FormControlLabel 
                                value="0" 
                                control={<Radio color="primary"/>}
                                label="Buy"
                                labelPlacement="Top"
                            />
                            <FormControlLabel 
                                value="1" 
                                control={<Radio color="secondary"/>}
                                label="Sell"
                                labelPlacement="Top"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid container xs={11} align="center">
                            <TextField
                                error={this.state.amount == 0} 
                                helperText={this.state.amount == 0 ? 'Must be more than 0' : null}
                                label="Amount"
                                type="number" 
                                required="true"
                                inputProps={{
                                    min:0 , 
                                    style: {textAlign:"center"}
                                }}
                                onChange={this.handleAmountChange}
                            />
                            <Select
                                label="Select Payment Currency"
                                required="true" 
                                defaultValue={this.defaultCurrency} 
                                inputProps={{
                                    style: {textAlign:"center"}
                                }}
                                onChange={this.handleCurrencyChange}
                            >
                                {
                                Object.entries(this.state.currencies_dict)
                                .map( ([key, value]) => <MenuItem value={parseInt(key)}>{value}</MenuItem> )
                                }
                            </Select>

                </Grid>
                <br/>
                <Grid item xs={12} align="center">
                    <FormControl >
                        <TextField 
                            label="Payment Method(s)"
                            type="text" 
                            require={true}  
                            inputProps={{
                                style: {textAlign:"center"},
                                maxLength: 35
                            }}
                            onChange={this.handlePaymentMethodChange}
                        />
                    </FormControl>
                </Grid>

                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText >
                            <div align='center'>
                                Choose a Pricing Method
                            </div>
                        </FormHelperText>
                        <RadioGroup row defaultValue="relative">
                            <FormControlLabel 
                            value="relative" 
                            control={<Radio color="primary"/>}
                            label="Relative"
                            labelPlacement="Top"
                            onClick={this.handleClickRelative}
                            />
                            <FormControlLabel 
                            value="explicit" 
                            control={<Radio color="secondary"/>}
                            label="Explicit"
                            labelPlacement="Top"
                            onClick={this.handleClickExplicit}
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
    {/* conditional shows either Premium % field or Satoshis field based on pricing method */}
                { this.state.isExplicit 
                        ? <Grid item xs={12} align="center">
                            <TextField 
                                    label="Satoshis"
                                    error={this.state.badSatoshis}
                                    helperText={this.state.badSatoshis}
                                    type="number" 
                                    required="true" 
                                    inputProps={{
                                        // TODO read these from .env file
                                        min:this.minTradeSats , 
                                        max:this.maxTradeSats , 
                                        style: {textAlign:"center"}
                                    }}
                                    onChange={this.handleSatoshisChange}
                                    // defaultValue={this.defaultSatoshis} 
                                />
                            </Grid>
                        :   <Grid item xs={12} align="center">
                                <TextField 
                                    label="Premium over Market (%)"
                                    type="number" 
                                    // defaultValue={this.defaultPremium} 
                                    inputProps={{
                                        style: {textAlign:"center"}
                                    }}
                                    onChange={this.handlePremiumChange}
                                />
                            </Grid>
                    }
                </Paper>
                </Grid>
            <Grid item xs={12} align="center">
                <Button color="primary" variant="contained" onClick={this.handleCreateOfferButtonPressed} >
                    Create Order
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                {this.state.badRequest ?
                <Typography component="subtitle2" variant="subtitle2" color="secondary">
                    {this.state.badRequest} <br/>
                </Typography>
                : ""}
                <Typography component="subtitle2" variant="subtitle2">
                    <div align='center'>
                        Create a BTC {this.state.type==0 ? "buy":"sell"} order for {this.state.amount} {this.state.currencyCode} 
                        {this.state.isExplicit ? " of " + this.state.satoshis + " Satoshis" : 
                            (this.state.premium == 0 ? " at market price" : 
                                (this.state.premium > 0 ? " at a " + this.state.premium + "% premium":" at a " + -this.state.premium + "% discount")
                            )
                        }
                    </div>
                </Typography>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
  }
}