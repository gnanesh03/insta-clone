import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment } from "@mui/material";
import VerticalLine from "../components/UI/VerticalLine";
import styles from "./Search.module.css";
import axios from "axios";
import List from "../components/UI/List/UserSearchResults/List";
import { IconButton } from "@mui/material";
import ImagesContainer from "../components/Post/PostGallery/GalleryWithNonFixedSizedImages/Container/Container";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Loading from "../components/Loading/Loading";
import SearchFilterPositionedMenu from "../components/Menu/SearchFilter/SearchFilterMenu";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// let timeout_id;
// console.log("interesting");

// commented out because this is so unnecessarily complex
// function debounce(func, timeout = 500) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func.apply(this, args);
//     }, timeout);
//   };
// }

const Search = ({}) => {
  const input_ref = useRef(null);
  const [search_type, setSearchType] = useState("posts");
  const [search_query, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const timeoutRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [total_posts_count, setTotalPostsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  //console.log("navigate() of useNavigate causes re-renders??"); YES IT DOES

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const page = searchParams.get("page");
  const sort_type = searchParams.get("sort");

  // dynamic page
  useEffect(() => {
    if (query && page) {
      //// CALLBACK?? for set state
      setSearchQuery(query);
      fetchPostSearchResults();
    }
  }, [query, page, sort_type]);

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchUserSearchResults = async (search_query) => {
    if (search_query == "") {
      return;
    }

    try {
      const result = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/search-users?query=${search_query}`,
        {
          withCredentials: true,
        }
      );

      const users = result.data.users;
      console.log(users);
      setUsers(users);
    } catch (error) {
      console.error("Error searching for users:", error);
    } finally {
    }
  };

  //   const debouncedSearch = useCallback(
  //     debounce((search_query) => {
  //       fetchUserSearchResults(search_query);
  //     }),
  //     []
  //   );

  const fetchPostSearchResults = async () => {
    if (search_type == "people") {
      return;
    }
    try {
      setIsLoading(true);
      const sort_argument = sort_type ? `&sort=${sort_type}` : "";
      const url =
        process.env.REACT_APP_BACKEND_URL +
        `/search-posts?query=${query}&page=${page}${sort_argument}`;
      const response = await axios.get(url, { withCredentials: true });
      // console.log(response.data.data.results);

      setPosts(response.data.data.results);
      setTotalPostsCount(response.data.data.total_count);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const style_for_selected_option = {
    borderBottom: "1px solid rgb(179, 170, 170)",

    boxShadow: "0px 4px  10px rgb(175, 168, 168)",
  };

  useEffect(() => {
    if (search_query == "") {
      setUsers([]);
      return;
    }

    if (search_type === "posts") {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchUserSearchResults(search_query);
    }, 1000);
  }, [search_query]);

  useEffect(() => {
    input_ref.current.focus();
  });

  const getPageResult = (event, value) => {
    navigate(`/search?page=${value}&query=${search_query}`);
  };

  return (
    <div className={styles.root}>
      <div style={{ width: "65%", display: "flex", alignItems: "center" }}>
        <TextField
          id="outlined-basic"
          // label="Outlined"
          variant="outlined"
          sx={{ width: "100%" }}
          placeholder={
            search_type === "people" ? "Search for people" : "Search for posts"
          }
          inputRef={input_ref}
          value={search_query}
          onChange={(e) => handleSearchQueryChange(e)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {" "}
                    <VerticalLine />
                    <IconButton
                      onClick={(e) => {
                        navigate(`/search?page=1&query=${search_query}`);
                      }}
                    >
                      <SearchIcon sx={{ cursor: "pointer" }} />
                    </IconButton>
                  </div>
                </InputAdornment>
              ),
            },
          }}
        />
        <SearchFilterPositionedMenu
          fetchPopularPosts={() => {
            navigate(`/search?page=1&query=${search_query}&sort=popular`);
          }}
        />
      </div>
      {isLoading && <Loading />}

      {users.length > 0 ? (
        <List users={users} />
      ) : (
        <div className={styles.options_bar}>
          <button
            className={styles.option}
            style={search_type === "posts" ? style_for_selected_option : null}
            onClick={() => setSearchType("posts")}
          >
            Posts
          </button>
          <button
            className={styles.option}
            style={search_type === "people" ? style_for_selected_option : null}
            onClick={() => setSearchType("people")}
          >
            People
          </button>
        </div>
      )}

      {posts.length > 0 && <ImagesContainer items={posts} />}

      {total_posts_count > 0 && (
        <Stack spacing={2} sx={{ margin: "50px" }}>
          <Pagination
            count={Math.ceil(total_posts_count / 9)}
            variant="outlined"
            shape="rounded"
            onChange={getPageResult}
            page={Number(page)}
          />
        </Stack>
      )}
    </div>
  );
};

export default Search;
