import Toast from 'react-native-toast-message';

export const sendLocationToAPI = async (
  userId: number | string,
  latitude: number | string,
  longitude: number | string,
  isBackToSchool: boolean,
  address: string = " "
): Promise<void> => {

  // EXACT payload expected by backend
  const payload = {
    userid: String(userId),
    IsBackToSchoool: isBackToSchool ? 1 : 0,
    latitude: String(latitude),
    longitude: String(longitude),
    address: address,
  };

  // Debug: verify before sending
  //console.log("TRACK PAYLOAD:", payload);

  try {
    const response = await fetch("https://crazyholidays.in/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const dataCrazy = await response.json();

    //const payload2 = {
      //userid: String(userId),
      //IsBackToSchoool: isBackToSchool ? 1 : 0,
      //latitude: String(latitude),
      //longitude: String(longitude),
      //address: JSON.stringify(dataCrazy),
      //payloadi: JSON.stringify(payload)
    //};

    //const response2 = await fetch("https://kareva.co.in/apicrazy/insert.php", {
      //method: "POST",
      //headers: {
        //"Content-Type": "application/json",
      //},
      //body: JSON.stringify(payload2),
    //});

    //const responseText = await response2.text();

    //console.log("STATUS:", response.status);
    //console.log("API RESPONSE:", responseText);

    //if (!response2.ok) {
      //throw new Error(`API failed: ${response.status}`);
    //}

    // ✅ SUCCESS TOAST
    Toast.show({
      type: 'success',
      text1: 'Location Sent',
      text2: 'Background location updated successfully',
      visibilityTime: 2000,
    });

  } catch (error) {
    //console.error("Location tracking failed:", error);
    Toast.show({
      type: 'error',
      text1: 'Location Failed',
      text2: 'Unable to send location',
    });
  }
};