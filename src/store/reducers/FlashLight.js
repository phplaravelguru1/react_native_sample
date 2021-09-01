let flashstatus = 'off';
export default function(state=flashstatus, action){
  switch (action.type) {
    case "Flashon": flashstatus = 'torch';

      break;
    case "Flashoff": flashstatus =  'off';
      break;
  }
  return flashstatus;
}