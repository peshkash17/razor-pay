'use client'
import React, { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import Script from 'next/script'
import { Button } from "@/components/ui/button"
import Razorpay from 'razorpay'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  interface CarItem {
    id: string;
    totalAmount: string;
    Car: string;
  }
  
  const ids: CarItem[] = [
    {
      id: "1",
      totalAmount: "250.00",
      Car: "Item 1",
    },
    {
      id: "2",
      totalAmount: "150.00",
      Car: "Item 2",
    },
    {
      id: "3",
      totalAmount: "350.00",
      Car: "Item 3",
    },
    {
      id: "4",
      totalAmount: "450.00",
      Car: "Item 4",
    },
    {
      id: "5",
      totalAmount: "550.00",
      Car: "Item 5",
    },
    {
      id: "6",
      totalAmount: "200.00",
      Car: "Item 6",
    },
    {
      id: "7",
      totalAmount: "300.00",
      Car: "Item 7",
    },
  ]
  
  


  export default function Cart() {
    const [selectedItem,setSelectedItem]= useState<CarItem[] >([])
    const [totalAmount,setTotalAmount] = useState('')

   async function handleAdd(item:CarItem){
    setSelectedItem(prevItem=>{
        if(prevItem.find(selectedItem=>selectedItem.id === item.id)){
            return prevItem
        }
        return [...prevItem, item]
    })
   }

   useEffect(() => {
    const total = selectedItem
        .map(item => {
            const amountString = typeof item.totalAmount === 'string' ? item.totalAmount : '';
            const numericAmount = parseFloat(amountString.replace(/[^0-9.-]/g, ''));
            return !isNaN(numericAmount) && numericAmount > 0 ? numericAmount : 0; 
        })
        .filter(amount => amount > 0);
        const sum = total.reduce((accumulator, currentValue) => accumulator + currentValue, 0);  
        
        setTotalAmount(sum.toString())
        
   }, [selectedItem]);


   const createOrderId = async () => {
    try {
     const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({
       amount: parseFloat(totalAmount)*100,
      })
     });
  
     if (!response.ok) {
      throw new Error('Network response was not ok');
     }
  
     const data = await response.json();
     return data.orderId;
    } catch (error) {
     console.error('There was a problem with your fetch operation:', error);
    }
   };




   const processPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
     const orderId: string = await createOrderId();
     const options = {
      key: process.env.key_id,
      amount: parseFloat(totalAmount) * 100,
      currency: 'INR',
      name: 'Kalpesh Pawar',
      description: 'description',
      order_id: orderId,
      handler: async function (response: any) {
       const data = {
        orderCreationId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
       };
  
       const result = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
       });
       const res = await result.json();
       if (res.isOk) alert("payment succeed");
       else {
        alert(res.message);
       }
      },
      prefill: {
       name: 'Kalpesh',
       email: 'Kalpesh@gmail.com',
      },
      theme: {
       color: '#3399cc',
      },
     };
     const paymentObject = new window.Razorpay(options);
     paymentObject.on('payment.failed', function (response: any) {
      alert(response.error.description);
     });
     paymentObject.open();
    } catch (error) {
     console.log(error);
    }
   };
  
   


    return (
   
        <div className='flex min-h-screen flex-col items-center justify-between p-24'>
                 <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
       />
      <Table>
        {/* <TableCaption>A list of your recent ids.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>Car</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ids.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.Car}</TableCell>
              <TableCell className="text-right">{item.totalAmount}</TableCell>
              <TableCell className="text-right"><Checkbox onClick={()=>handleAdd(item)} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">₹2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <form onSubmit={processPayment}>
        <div className='flex justify-center items-center gap-5'>
        <Button type='submit' variant="default">Place Order</Button>
        <h2>Total - {totalAmount}</h2>
        </div>
      
      </form>
      </div>
    )
  }
  
