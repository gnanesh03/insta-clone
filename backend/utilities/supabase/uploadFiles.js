const supabase = require("../supabase/client");

async function uploadFiles(files, user_id, post_id) {
  let file_paths = [];
  let index = 1;

  for (const file of files) {
    const { buffer, mimetype } = file;
    let file_type = mimetype.split("/")[1];

    let file_path =
      "posts_files/" +
      "user_" +
      user_id +
      "/" +
      "post_" +
      post_id +
      "/" +
      index +
      "." +
      file_type;

    file_paths.push(file_path);

    const { data, error } = await supabase.storage
      .from("instagram-clone")
      .upload(file_path, buffer, {
        contentType: mimetype,
      });

    if (error) {
      console.log(error);
    }
    index++;
  }

  return file_paths;
}

// for signed private images
async function uploadProfilePic(file, user_id) {
  const { buffer, mimetype } = file;
  let file_type = mimetype.split("/")[1];

  let file_path = "user_files/" + "profile_pics/" + user_id + "." + file_type;

  const { data, error } = await supabase.storage
    .from("instagram-clone")
    .upload(file_path, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    console.log(error);
    return null;
  } else {
    return file_path;
  }
}

async function uploadProfilePicToPublic(file, user_id) {
  const { buffer, mimetype } = file;
  let file_type = mimetype.split("/")[1];
  let file_name = "";

  let file_path = "user-profile-images/" + user_id + "." + file_type;

  file_name = user_id + "." + file_type;

  const { data, error } = await supabase.storage
    .from("instagram-clone-profile-images")
    .upload(file_path, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    console.log(error);
    return null;
  } else {
    return file_name;
  }
}

async function createSignedUrls(paths) {
  let signed_urls = [];

  const { data, error } = await supabase.storage
    .from("instagram-clone")
    .createSignedUrls(paths, 60 * 60); //valid for 60 minutes

  if (error) {
    console.log(error);
  } else {
    //console.log(data);
    for (const i of data) {
      signed_urls.push(i.signedUrl);
    }
  }
  return signed_urls;
}

async function createSignedUrlForProfilePic(path) {
  const { data, error } = await supabase.storage
    .from("instagram-clone")
    .createSignedUrl(path, 60 * 60); //valid for 60 minutes

  if (error) {
    console.log(error);
    return null;
  } else {
    return data.signedUrl;
  }
}

module.exports = {
  uploadFiles,
  createSignedUrls,
  uploadProfilePic,
  uploadProfilePicToPublic,
  createSignedUrlForProfilePic,
};
