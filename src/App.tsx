import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './App.css'; // Import the CSS styles

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(true);

  const apiKeys: string[] = [
    'db751b0a05msh95365b14dcde368p12dbd9jsn440b1b8ae7cb',
    '0649dc83c2msh88ac949854b30c2p1f2fe8jsn871589450eb3',
    '0e88d5d689msh145371e9bc7d2d8p17eebejsn8ff825d6291f',
    'ea7a66dfaemshecacaabadeedebbp17b247jsn7966d78a3945',
  ];

  let currentKeyIndex = 0;

  const getNextApiKey = (): string => {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return apiKeys[currentKeyIndex];
  };

  const youtube_parser = (url: string): string | false => {
    url = url.replace(/\?si=.*/, '');
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : false;
  };

  const handleSubmit = async () => {
    const apiKey = getNextApiKey();
    const youtubeID = youtube_parser(inputUrl);

    if (!youtubeID) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid URL',
        text: 'Please enter a valid YouTube or YouTube Music URL.',
      });
      return;
    }

    try {
      const response = await axios.get<{ link: string }>(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${youtubeID}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com',
          },
        }
      );

      if (response.data && response.data.link) {
        setDownloadLink(response.data.link);
        setIsSearching(false);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your MP3 is ready for download.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Something went wrong. Please try again.',
      });
    }

    setInputUrl(''); // Clear the input field
  };

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
      setDownloadLink(null);
      setIsSearching(true); // Show the search button again after download
    }
  };

  return (
    <div className="app">
      <section className="content">
        <h1 className="content_title">YouTube to MP3 Converter</h1>
        <p className="content_description">
          Transform YouTube videos into MP3s in just a few clicks!
        </p>
        <div className="form">
          {isSearching && (
            <>
              <input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste a Youtube video URL link..."
                className="form_input"
                type="text"
              />
              <button onClick={handleSubmit} className="form_button">
                Search
              </button>
            </>
          )}
        </div>
        {downloadLink && (
          <button onClick={handleDownload} className="download_btn">
            Download MP3
          </button>
        )}
      </section>
    </div>
  );
};

export default App;
