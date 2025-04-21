export async function fetchEvents(today){
    try {
      const [res1, res2, res3, res4] = await Promise.all([
        fetch(`http://franklopez.tech:5050/academiccalendar_daily/${today}`),
        fetch(`http://franklopez.tech:5050/involvementcenter_daily/${today}`),
        fetch(`http://franklopez.tech:5050/rebelcoverage_daily/${today}`),
        fetch(`http://franklopez.tech:5050/unlvcalendar_daily/${today}`),
      ]);
  
      const [data1, data2, data3, data4] = await Promise.all([
        res1.json(), res2.json(), res3.json(), res4.json()
      ]);
  
      return [data1, data2, data3, data4];
    } catch (err) {
      console.error('Error fetching events:', err);
      return [null, null, null, null];
    }
  };