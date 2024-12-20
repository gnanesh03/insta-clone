const supabase = require("../supabase/client");

async function uploadFiles(files, user_id, post_id) {
  let file_paths = [];
  let index = 1;

  for (const file of files) {
    const { buffer, mimetype } = file;
    let file_path =
      "posts_files/" +
      "user_" +
      user_id +
      "/" +
      "post_" +
      post_id +
      "/" +
      index;

    let file_type = mimetype.split("/")[1];

    file_paths.push(file_path + "." + file_type);

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

async function createSignedUrls(paths) {
  let signed_urls = [];

  const { data, error } = await supabase.storage
    .from("instagram-clone")
    .createSignedUrls(paths, 60 * 60); //valid for 60 minutes

  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  return signed_urls;
}

module.exports = { uploadFiles, createSignedUrls };
