import { useEffect, useState } from "react";
import Table from "./components/Table";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  const [apidata,setData] =useState([]);
  const [appname,setAppname]=useState([]);
  let name='';
  const [columndata,setColumndata]=useState([
    {
      name:'Date',
      class:'date',
      headername:'Date',
      id:1,
    },
    {
      name:'App',
      class:'app_name',
      headername:'App',
      id:2
    },
    {
      name:'Ad Response',
      class:'responses',
      headername:'Responses',
      id:3,
    },{
      name:'Ad Requests',
      class:'requests',
      headername:'Requests',
      id:4,
    },{
      name:'Revenue',
      class:'revenue',
      headername:'Revenue',
      id:5,
    },{
      name:'Impression',
      class:'impressions',
      headername:'Impression',
      id:6,
    },{
      name:'Clicks',
      class:'clicks',
      headername:'Clicks',
      id:7,
    },{
      name:'Fill Rate',
      class:'fillrate',
      headername:'Fill Rate',
      id:8,
    },
    {
      name:'CTR',
      class:'ctr',
      headername:'CTR',
      id:9,
    },
  ]);
  
 //fetching api's data

 //fetching appnames api
 useEffect(()=>{
  const appdata=()=>{
    fetch("https://go-dev.greedygame.com/v3/dummy/apps")
    .then((response)=>response.json())
    .then((actualdata)=>{
      setAppname(actualdata.data);
    })
    .catch((err)=>{
      console.log(err.message);
    });
  }
  appdata();
 },[]); 

//fetching main api data
useEffect(() => {
  const fetchData = () => {
    fetch("https://go-dev.greedygame.com/v3/dummy/report?startDate=2021-05-01&endDate=2021-05-03")
      .then((response) => response.json())
      .then((actualData) => {
        const finaldata=actualData.data.map((item,i)=>(
            {...item,fillrate:item.requests/item.responses,ctr:item.clicks/item.impressions,id:i} 
          )
        );
        setData(finaldata.map(item=>{
          {appname.map(value=>{
            if(item.app_id===value.app_id)name=value.app_name;
          })}
          return(
          {...item,app_name:name}
          );
         }));
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
    fetchData();
  }, [appname]);

  return (
    <Router>
      <Routes>
      <Route exact path="/" element={ <Table data={apidata} columndata={columndata}/>}/>
      </Routes>
    </Router>
  );
 
}

export default App;
