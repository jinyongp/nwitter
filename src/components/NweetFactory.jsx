import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { firestore, storage } from '../firebase';

const NweetFactory = ({ user }) => {
  const MAX_LENGTH = 120;
  const [content, setContent] = useState('');
  const [length, setLength] = useState(0);
  const [attachment, setAttachment] = useState();

  const onChange = (event) => {
    event.preventDefault();
    const { target: { value } } = event;
    setContent(value);
    setLength(value.length);
  };

  const onFileChange = (event) => {
    const { target: { files: [file] } } = event;
    const reader = new FileReader();
    reader.addEventListener('loadend', (readEvent) => {
      const { currentTarget: { result } } = readEvent;
      setAttachment(result);
    });
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentUrl = '';
    try {
      if (attachment) {
        const attachmentReference = storage.ref().child(`${user.uid}/${uuid()}`);
        const response = await attachmentReference.putString(attachment, 'data_url');
        attachmentUrl = await response.ref.getDownloadURL();
      }
      const nweet = {
        text: content,
        attachmentUrl,
        creatorId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await firestore.collection('nweets').add(nweet);
      setContent('');
      setAttachment('');
    } catch (error) {
      console.error(error);
    }
  };

  const onClearImage = () => {
    setAttachment();
  };

  return (
    <form onSubmit={onSubmit}>
      <textarea
        type="text"
        value={content}
        placeholder="What's on your mind?"
        maxLength={MAX_LENGTH}
        onChange={onChange}
        required
      />
      <span>{`${length}/${MAX_LENGTH}`}</span>
      <input type="file" accept="image/*" onChange={onFileChange} />
      <input type="submit" value="Nweet" />
      {!!attachment && (
        <div>
          <img src={attachment} alt="" width="50px" />
          <input type="button" value="Clear" onClick={onClearImage} />
        </div>
      )}
    </form>
  );
};

NweetFactory.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
  }),
};

NweetFactory.defaultProps = {
  user: null,
};

export default NweetFactory;
