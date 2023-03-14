import React, { useEffect, useState } from 'react'
import styles from '../styles/Collection.module.css'
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Pinata from "@pinata/sdk";
import MyNFT from "../artifacts/contracts/Lock.sol/Lock.json";
import axios from 'axios';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
export default function Collection({address}) {
 const cA="0xbf3748963FC050186AA514e79eEc4913525580C4"
 const [nftid,setNftId]=useState("")
 const { connect, connectors, error, isLoading, pendingConnector } =
 useConnect()
 const {  connector, isConnected } = useAccount()
 const { disconnect } = useDisconnect()
    const [data,setData]=useState([])
    const [openModal,setOpenModal]=useState(0)
    const [to,setTo]=useState("")
    useEffect(()=>{
        getNfts()
    },[address])
const getNfts=async()=>{
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'X-API-KEY': 'jaynarutomis_sk_347ebe6c-c571-44f4-a082-3332d79af181_zu22i7nycxsdos2u' }
      };
      
      await fetch(`https://api.simplehash.com/api/v0/nfts/owners?chains=polygon-mumbai&wallet_addresses=${address}&contract_addresses=${cA}`, options)
        .then(response => response.json())
        .then(response =>{ setData(response.nfts);
            console.log(response.nfts)
        })
        .catch(err => console.error(err));
}
const transfer = async (data) => {
   setOpenModal(1)
   console.log(data.token_id)
setNftId(data.token_id)
  };

  const transferNFT=async()=>{
    try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(cA, MyNFT.abi, signer);
        const transaction = await contract.transferNFT(address.toString(),to.toString(),parseInt(nftid ? nftid : ''), { gasPrice: ethers.utils.parseUnits("50", "gwei") } );
        await transaction.wait();
        alert("NFT is transferred!");
    }
    catch(e)
    {
        console.log(e);

    }
 
  }

  return (
    <div className={styles.body}>
        {
           openModal === 1 ? <div className={styles.bkg} ></div>:<div></div>
        }
            {openModal ? 
            <div className={styles.modal}>
        <div className={openModal ? styles.confirmShow : styles.confirm}>
          {isConnected ?

            <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}} >
             


                 <div className={styles.form_group}>
          <label className={styles.label} >Wallet</label>
          <input className={styles.input} type="text" onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className={styles.form_group}>
        <button className={styles.button2} onClick={()=>{transferNFT()}}>
            Send
          </button></div>



            </div>

            :
           ""
          }

          <button className={styles.cancel} onClick={() => setOpenModal(0)}>Cancel</button>


        </div>
        <div
          className={styles.overlay}
          onClick={() => setOpenModal(0)}
        />

      </div>
    :""  
    }


        <div className={styles.collection} > 
        <p className={styles.title}>
            Last minted certificates
        </p>
        <hr color='white' style={{width:'100%',marginBottom:'20px'}} ></hr>
           {
            data ? data.map((data)=>(
                <div
                onClick={()=>transfer(data)}
                 className={styles.card} >
                    <img src={data.image_url} alt=''/>
                </div>
            )):""
           }
          
        </div >
    </div>

  )
}
