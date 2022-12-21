import React, { useMemo } from 'react'
import { useState,useEffect,useRef } from "react";
import "../App.css";
import { ArrowDownward,ArrowUpward,Tune,FilterAlt} from '@mui/icons-material';
import moment from "moment";
import {DragDropContext,Droppable,Draggable} from "react-beautiful-dnd";
import { DateRangePicker } from 'react-date-range'
import format from 'date-fns/format'
import { addDays } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import {useNavigate,createSearchParams,useSearchParams} from "react-router-dom"

//sorting
const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);
    const sortedItems = useMemo(() => {
      let sortableItems = [...items];
      if (sortConfig !==null) {
        sortableItems.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [items, sortConfig]);
  
    const requestSort = (key) => {
      let direction = 'ascending';
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === 'ascending'
      ) {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };
  
    return { items: sortedItems, requestSort, sortConfig };
  };


//filtering
const usefilterdata=(items,searchitem,columnitem)=>{
  let newsorteditems=[];
  if(columnitem==="date"){
   newsorteditems= items.filter(item=>moment(`${item[columnitem]}`).format("D MMM YYYY")===searchitem)
  }
  else if(columnitem==="revenue"){
    newsorteditems= items.filter(item=>Math.round(item[columnitem]).toFixed(2)===searchitem);
  }
   else if(columnitem==="fillrate"){
    newsorteditems= items.filter(item=>Math.round(item[columnitem]).toFixed(2)===searchitem);
  }
  else if(columnitem==="ctr"){
    newsorteditems= items.filter(item=>Math.round(item[columnitem]).toFixed(2)===searchitem);
  }
  else{
     newsorteditems= items.filter(item=>item[columnitem]===searchitem);
    
  }
   return {newsorteditems};
}


const Table = (props) => {
  let   headclass=[];
  const apidata=props.data;
  const navigate=useNavigate();
  const [arr,setarr]=useState([]);
  const [duplis,setduplis]=useState([]);
  const [value,setvalue]=useState([]);
  const [column,setcolumn]=useState([]);
  let   [openmenu,setopenmenu]=useState(true);
  const [searchparams]=useSearchParams();
  const [duplicates,setduplicates]=useState([]);
  const [searchitem,setsearchitem]=useState([]);
  const [columnitem,setcolumnitem]=useState([]);
  const [columnheaders,setheadername]=useState(props.columndata);
  const [columndata,setcolumndata]=useState(props.columndata);
  const [array,setarray]=useState(['date','app_name','responses','requests','revenue','impression','clicks','fillrate','ctr']);
  const [orderingcolumn,setorderingcolumn]=useState(['date','app_name','responses','requests','revenue','impression','clicks','fillrate','ctr']);

//datepicker
const [range, setRange] = useState([
  {
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: 'selection'
  }
])
// open close
const [open, setOpen] = useState(false)

// get the target element to toggle 
const refOne = useRef(null)

useEffect(() => {
  // event listeners
  document.addEventListener("keydown", hideOnEscape, true)
  document.addEventListener("click", hideOnClickOutside, true)
}, [])

// hide dropdown on ESC press
const hideOnEscape = (e) => {
  // console.log(e.key)
  if( e.key === "Escape" ) {
    setOpen(false)
  }
}
// Hide dropdown on outside click
const hideOnClickOutside = (e) => {
  if( refOne.current && !refOne.current.contains(e.target) ) {
    setOpen(false)
  }
}
  
//hiding
//copying changes
const applychanges=()=>{
    setduplis(()=>arr.slice());
      headclass=[];
    setheadername(()=>columndata.slice());
    columndata.map((item)=>{
      headclass.push(item.class);
    });
    setarray(()=>headclass.slice());
}
//settings 
const menuoptions=()=>{
setopenmenu(openmenu=false);
};
const removeclose=()=>{
    setopenmenu(openmenu=true);
}



//filtering date based rows
const orientation = window.innerWidth<760? 'vertical' : 'horizontal';
let startdate=moment(range[0].startDate).format("DD MM YYYY");
let enddate=moment(range[0].endDate).format("DD MM YYYY");
useEffect(()=>{
  startdate=moment(range[0].startDate).format("DD MM YYYY");
  enddate=moment(range[0].endDate).format("DD MM YYYY");
},[range[0].startDate,range[0].endDate]);


//filtering columns
const {newsorteditems}= usefilterdata(apidata,searchitem,columnitem);
let columndataitems=newsorteditems;
useEffect(()=>{
  const {newsorteditems}= usefilterdata(apidata,searchitem,columnitem);
   columndataitems=newsorteditems;
   },[searchitem,columnitem]);

//sorting
const { items, requestSort, sortConfig } = useSortableData(newsorteditems.length===0?apidata:newsorteditems);
 columndataitems=items;
 const getClassNamesFor = (name) => {
  if (!sortConfig) {
    return;
  }
  return sortConfig.key === name ? sortConfig.direction : undefined;
};

//shareable links
useEffect(()=>{
  const params={
    searchvalue:[value],
    column:[column],
    columnshided:duplis.join(','),
    swaporder:array.join(','),
  };
  const options={
    pathname:'/',
    search:`?${createSearchParams(params)}`,
  };
  navigate(options,{replace:true});
},[value,column,array,duplis,navigate]);

useEffect(()=>{
  setsearchitem(searchparams.get('searchvalue'));
  setcolumnitem(searchparams.get('column'));
  setorderingcolumn(searchparams.get('swaporder'));
 setduplicates(searchparams.get('columnshided'));
},[searchparams]);

//reorder
const dragEnd=(result)=>{
  if(!result.destination)return;
  const columnitems=[...columndata];
  const [reorderedcolumns]=columnitems.splice(result.source.index,1);
  const [addcolumn]=columnitems.splice(result.destination.index,1);
  columnitems.splice(result.destination.index,0,reorderedcolumns);
  setcolumndata(columnitems);
  columnitems.splice(result.source.index,0,addcolumn);
  setcolumndata(columnitems);
}
  
    return (
      <div className="App">
        <h3 className="heading">Analytics</h3>
        <div className="top">
          <div className="left">
            <div className="calendarWrap">
              <input
                value={`${format(range[0].startDate, "dd MMM yyyy")} - ${format(range[0].endDate, "dd MMM yyyy")}`}
                readOnly
                className="inputBox"
                onClick={ () => setOpen(open => !open) }
              />
              <div ref={refOne} className="ranges">
                {open && 
                  <DateRangePicker
                    onChange={item => setRange([item.selection])}
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    months={2}
                    direction={orientation}
                    className="calendarElement"
                  />
                }
              </div>
            </div>
          </div>
          <div className="right" onClick={menuoptions}>
            <Tune style={{color:'blue'}}/>
              <span>Settings</span>
          </div>
        </div>
        <div className="hidden" style={{display:openmenu?'none':''}}>
        <h4>Dimensions and Metrics</h4>
        <DragDropContext onDragEnd={dragEnd}>
          <Droppable 
            droppableId="droppable"
            direction='horizontal'
            type='column'
            >
            {(provided)=>(
              <div className="btns"
               {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {columndata.map((item,i)=>(
                    <Draggable 
                     draggableId={`draggable-${i}`}
                     key={`draggable-${i}`}
                     index={i}>
                        {(provided,snapshot)=>(
                          <span
                          className='hiddenitems'
                           ref={provided.innerRef}
                           {...provided.draggableProps} 
                           {...provided.dragHandleProps}>
                              <span className="span"
                                style={{borderLeft:!arr.includes(item.class)?"2px solid blue":''}} 
                                onClick={()=>{item.class!=='date' && item.class!=="app_name" && !arr.includes(item.class)?setarr((oldarr)=>[...oldarr,item.class]):setarr((current)=>current.filter((name)=>name !==item.class))}}>
                                  {item.name}
                              </span>
                          </span>
                        )}
                    </Draggable>
                ))} 
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div class="buttons">
          <input type="button" className="button changes" value="Apply changes" onClick={applychanges}/>
          <input type="button" className="button" value="Close" onClick={removeclose}/>
        </div>
        </div>
        <div className="table">
        <table>
        <tbody>
          
            <tr>
              {columnheaders.map((item,i)=>
                      !duplicates?.includes(item.class) ?(
                    <th> 
                      <span className='iconandinput'>
                        <FilterAlt style={{margin:'auto'}}/>
                       <input type="text"  className="search" onChange={(e)=>{setvalue(e.target.value);setcolumn(item.class)}} />
                      </span>
                      <span className="sort">
                      <span className='header'>{item.headername}</span>
                      <div className="sorticon"> 
                        { getClassNamesFor(item.class)==='descending'?<ArrowUpward onClick={()=>requestSort(item.class)}/>:<ArrowDownward onClick={()=>requestSort(item.class)}/> }
                      </div>
                      </span>
                    </th>):('')
              )}
            </tr>
         
            {newsorteditems.length>0 && value.length>0 && columndataitems.map((item,index) => (
              <tr key={index}>
                     {columnheaders.map((header,i)=>{
                      if(header.class==='date') return (duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate)  ? (""):(<td  className="leftalign"> {moment(`${item.date}`).format("D MMM YYYY")}{" "}</td>));
                      else if(header.class==='fillrate' || header.class==='ctr' ) return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{Math.round(item[header.class]).toFixed(2)}%</td>));
                      else if (header.class==='revenue') return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">${Math.round(item[header.class]).toFixed(2)}</td>));
                      else if (header.class==="app_name") return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{item[header.class]}</td>));
                      else return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{item[header.class]?.toLocaleString()}</td>));
               
                    })}
              </tr>
            ))}
            { newsorteditems.length===0 && value.length<1 && items.map((item,index) => (
              <tr key={index}>
                {columnheaders.map((header,i)=>{
                  if(header.class==='date') return (duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate)  ? (""):(<td  className="leftalign"> {moment(`${item.date}`).format("D MMM YYYY")}{" "}</td>));
                  else if(header.class==='fillrate' || header.class==='ctr' ) return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{Math.round(item[header.class]).toFixed(2)}%</td>));
                 else if (header.class==='revenue') return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">${Math.round(item[header.class]).toFixed(2)}</td>));
                 else if (header.class==="app_name") return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{item[header.class]}</td>));
                 else return((duplicates?.includes(header.class)  || !((moment(item.date).format("DD MM YYYY")>=startdate) && moment(item.date).format("DD MM YYYY")<=enddate) ) ? (""):(<td  className="leftalign">{item[header.class]?.toLocaleString()}</td>));
               
                })}
              </tr>
            ))} 
        </tbody>
        </table>
        </div>
       
      </div>
    );
}
export default Table