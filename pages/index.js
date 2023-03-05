import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Pinata from "@pinata/sdk";
import MyNFT from "../artifacts/contracts/Lock.sol/Lock.json";
import axios from 'axios';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useProvider,
} from 'wagmi'
import Collection from '../components/Collection';

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
const pinata = new Pinata("a6ab678dc3d416f913e5", "af63f4cd3a73988f6c01f5435c4420d2a606932912d8439d57754d79c611c445");

export default function Home() {
  const { connect, connectors, error, isLoading, pendingConnector } =
useConnect()
const { address, connector, isConnected } = useAccount()
const { data: ensName } = useEnsName({ address })
const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false);
  const handleConfirm = (result) => {
    if (result) {
      console.log('some action...')
    }

    setOpen(false)
  }
  const [fileUrl, setFileUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [loading, setLoading] = useState(false);
 const cA="0xdDCd7634BA854DBb9F8CcBB19767d19BA5045799"
  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const metadata = {
      name,
      description,
      image: fileUrl,
    };
    const metadataUrl = await uploadMetadata(metadata);
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, MyNFT.abi, signer);
    const transaction = await contract.mint(whitelistAddress, metadataUrl);
    await transaction.wait();
    setLoading(false);
    alert("Your NFT has been minted!");
  }

  const pinJSONToIPFS = async json => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    return axios
      .post(url, json, {
        headers: {
          pinata_api_key: "a6ab678dc3d416f913e5",
          pinata_secret_api_key: "af63f4cd3a73988f6c01f5435c4420d2a606932912d8439d57754d79c611c445",
        },
      })
      .then(function (response) {
        return response.data.IpfsHash
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  async function uploadMetadata(metadata) {


    const ipfsJsonHash = await pinJSONToIPFS(metadata)

    // const { path } = await client.add(JSON.stringify(metadata));
    // const { IpfsHash } = await pinata.pinByHash(path);
    // return `https://ipfs.io/ipfs/${ipfsJsonHash}`;
    return `ipfs://${ipfsJsonHash}`
  }

  const pinFileToIPFS = async (file, pinataMetaData) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
  
    let data = new FormData()
  
    data.append('file', file)
    data.append('pinataMetadata', JSON.stringify(pinataMetaData))
  
    return axios
      .post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: "a6ab678dc3d416f913e5",
          pinata_secret_api_key: "af63f4cd3a73988f6c01f5435c4420d2a606932912d8439d57754d79c611c445",
        },
      })
      .then(function (response) {
        return response.data.IpfsHash
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  
  const handleMint = async (event) => {
    event.preventDefault();
try{
  const metadata = {
    name,
    description,
    image: fileUrl ? fileUrl :"",
  };
  const pinataMetaData = {
    name: `${name} - ${description}`,
  }
  console.log(metadata)
  const ipfsImageHash = await pinFileToIPFS(fileUrl, pinataMetaData)

  const imageMetaData = {
    name: name,
    description: description,
    image: `ipfs://${ipfsImageHash}`,
  }
  const metadataUrl = await uploadMetadata(imageMetaData);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(cA, MyNFT.abi, signer);

  // Call the mint function on the smart contract
  const transaction = await contract.mint(address,metadataUrl, { gasPrice: ethers.utils.parseUnits("50", "gwei") } );
  await transaction.wait();
  setLoading(false);
  alert("Your NFT has been minted!");
}
catch(e)

{
  alert("Sender is not whitelisted or there might be some error. Please try again!")
}
   
  };
  const handleWhite = async (event) => {
    event.preventDefault();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(cA, MyNFT.abi, signer);

    // Call the mint function on the smart contract
    const transaction = await contract.addToWhitelist([whitelistAddress ? whitelistAddress.toString():""]);
    await transaction.wait();
    setLoading(false);
    alert("You have been whitelisted!");
  };









  return (<>
  <Head>
        <title>Mint certificates</title>
        <meta name="description" content="Certificate NFT Minter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="" />
      </Head>
   {open && <div className={styles.modal}>
        <div className={open ? styles.confirmShow : styles.confirm}>
          {!isConnected ?

            <div>
             
              <div className={styles.wallets}>

                {connectors.map((connector) => (
                  <div>

                    <button
                      className={styles.walletbtn}
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => connect({ connector })}
                    >
                      {connector.name}
                      {!connector.ready && ' (unsupported)'}
                      {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                    </button>
                  </div>

                ))}

              </div>

            </div>

            :
           ""
          }

          <button className={styles.cancel} onClick={() => handleConfirm(false)}>Cancel</button>


        </div>
        <div
          className={styles.overlay}
          onClick={() => handleConfirm(false)}
        />

      </div>}
    {
      isConnected ?
     <>
      <div className={styles.container}>
      <div  className={styles.btns}>
      {
          isConnected ?
          <div className={styles.connect}>
          <button onClick={()=>{disconnect()}} >
           DISCONNECT
          </button>
          
        
        </div>
        :
        <div className={styles.connect}>
        <button onClick={()=>{setOpen(true)}} >
         CONNECT
        </button>
        </div>
        }
         
      </div>
      
        
          
            <div className={styles.card}>
  <div className={styles.tools}>
    <div className={styles.circle}>
      <span className={styles.red}></span>
    </div>
    <div className={styles.circle}>
      <span className={styles.yellow}></span>
    </div>
    <div className={styles.circle}>
      <span className={styles.green}></span>
    </div>
  </div>
  <div className={styles.card__content}>

  <form className={styles.form} >
        <div className={styles.form_group}>
          <label className={styles.label} >Name</label>
          <input className={styles.input} type="text" onChange={(event) => setName(event.target.value)} />
        </div>
        <div className={styles.form_group}>
          <label className={styles.label}>Description</label>
          <input className={styles.input} type="text" onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className={styles.form_group}>
          <label className={styles.label}>Image</label>
          <input className={styles.file_input} type="file"   onChange={e => setFileUrl(e.target.files[0])}
 />
        </div>
        {
          address === "0xdd41532DF4DBa94eD835DD9c57fAB5BA97b15E98"
          ?
          <div className={styles.form_group}>
          <label className={styles.label}>Whitelist Address</label>
          <input className={styles.input} type="text" onChange={(event) => setWhitelistAddress(event.target.value)} />
          <button className={styles.button2} onClick={handleWhite}>
            Click
          </button>
        </div>
        :
        ""

        }
     
        

        <button className={styles.button}  onClick={handleMint}>Mint</button>
        {loading && <p className={styles.loading}>Loading...</p>}
      </form>
  </div>
</div>
      {/* <h1 className={styles.title}>Mint Your Own Certificate!</h1> */}
  

    </div>
    <div>
      <Collection address={address} />
    </div>
  </>
     
      :
      <>

      <div className={styles.notConnected} >
        <div>
          <img src='./metamask.png' alt=''/>
        </div>
        <div className={styles.metamask}>
       <p>Connect your Metamask wallet to Polygon testnet(Mumbai)</p>
        </div>
        {
          isConnected ?
          <div className={styles.connect2}>
          <button onClick={()=>{disconnect()}} >
           DISCONNECT
          </button>
          
        
        </div>


        :


        <div className={styles.connect2}>
        <button onClick={()=>{setOpen(true)}} >
         CONNECT
        </button>
        </div>
        }
      </div>

   

      </>
    }

 </> );
}
