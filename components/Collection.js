import React, { useEffect, useState } from 'react'
import styles from '../styles/Collection.module.css'

export default function Collection({address}) {
    const [data,setData]=useState([])
    useEffect(()=>{
        getNfts()
    },[address])
const getNfts=async()=>{
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'X-API-KEY': 'jaynarutomis_sk_347ebe6c-c571-44f4-a082-3332d79af181_zu22i7nycxsdos2u' }
      };
      
      await fetch(`https://api.simplehash.com/api/v0/nfts/owners?chains=polygon-mumbai&wallet_addresses=${address}&contract_addresses=0xdDCd7634BA854DBb9F8CcBB19767d19BA5045799`, options)
        .then(response => response.json())
        .then(response =>{ setData(response.nfts)})
        .catch(err => console.error(err));
}
  return (
    <div className={styles.body}>
          
        <div className={styles.collection} > 
        <p className={styles.title}>
            Last minted certificates
        </p>
        <hr color='white' style={{width:'100%',marginBottom:'20px'}} ></hr>
           {
            data ? data.map((data)=>(
                <div className={styles.card} >
                    <img src={data.image_url} alt=''/>
                </div>
            )):""
           }
          
        </div >
    </div>

  )
}
