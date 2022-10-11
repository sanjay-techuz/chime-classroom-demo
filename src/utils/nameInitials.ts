export function nameInitials(name: string) {
    let initials;
    if(name){
        initials = name?.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g)?.join("");
    }else{
        initials = "#";
    }
    return initials;
  }
  