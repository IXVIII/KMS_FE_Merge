import React from 'react';

const KMS_ProgressBar = ({ progress }) => {
  const progressBarContainerStyle = {
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: '5px',
    overflow: 'hidden',
    height: '10px',
    margin: '10px 0'
  };

  const progressBarStyle = {
    height: '100%',
    backgroundColor: '#1dd1a1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.5s ease-in-out',
    width: `${progress}%`,
    borderRadius: '5px',
    color: '#fff',
    fontSize: '12px'
  };

  const progressLabelStyle = {
    color: '#333',
    fontWeight: 'bold'
  };

  return (
    <div style={progressBarContainerStyle}>
      <div style={progressBarStyle}>
      </div>
    </div>
  );
};

export default KMS_ProgressBar;
