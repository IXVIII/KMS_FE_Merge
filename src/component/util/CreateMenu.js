import { ROOT_LINK, API_LINK, APPLICATION_ID } from "./Constants";
import UseFetch from "./UseFetch";

const CreateMenu = async (role) => {
  let data;
  
  try {
    while (true) {
      data = await UseFetch(API_LINK + "Utilities/GetListMenu", {
        username: "",
        role: role,
        application: APPLICATION_ID,
      });
      
      if (data.status === 500)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      else if (data.length === 0) 
        await new Promise((resolve) => setTimeout(resolve, 2000));
      else {
        let lastHeadkey = "";
        const transformedMenu = [
          {
            head: "Logout",
            headkey: "logout",
            link: ROOT_LINK + "/logout",
            sub: [],
          },
          {
            head: "Beranda",
            headkey: "beranda",
            link: ROOT_LINK + "/",
            sub: [],
          },
        ];
  
        data.forEach((item) => {
          if (item.parent === null || item.link === "#") {
            lastHeadkey = item.nama.toLowerCase().replace(/\s/g, "_");
            transformedMenu.push({
              head: item.nama,
              headkey: lastHeadkey,
              link: item.link === "#" ? item.link : ROOT_LINK + "/" + item.link,
              sub: [],
            });
          } else {
            const parent = transformedMenu.find(
              (item) => item.headkey === lastHeadkey
            );
            if (parent) {
              parent.sub.push({
                title: item.nama,
                link: ROOT_LINK + "/" + item.link,
              });
            }
          }
        });
  
        return transformedMenu;
      }
    }
  } catch {
    return [];
  }
};

export default CreateMenu;
