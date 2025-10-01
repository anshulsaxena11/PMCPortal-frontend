import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const Marquee = ({
  text = 'This is a default marquee text!',
  speed = 10,
  direction = 'left',
  backgroundColor = '#f5f5f5',
  textColor = '#000',
  fontSize = '1rem',
  pauseOnHover = true,
  stopInCenter = false,
  mode = 'scroll', // "scroll" (default) or "fixed"
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [translateX, setTranslateX] = useState(null);

  useEffect(() => {
    if (mode === 'scroll' && stopInCenter && containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;

      const centerPosition = (containerWidth - textWidth) / 2;

      // For right-to-left, invert the direction
      const from = direction === 'left' ? containerWidth : -textWidth;
      const to = centerPosition;

      setTranslateX({ from, to });
    }
  }, [stopInCenter, direction, text, mode]);

  let animationStyles = {};

  if (mode === 'scroll') {
    const animationName = stopInCenter ? 'marquee-to-center' : 'marquee-loop';

    animationStyles =
      stopInCenter && translateX
        ? {
            animation: `${animationName} ${speed}s linear forwards`,
            '@keyframes marquee-to-center': {
              from: { transform: `translateX(${translateX.from}px)` },
              to: { transform: `translateX(${translateX.to}px)` },
            },
          }
        : {
            animation: `${animationName} ${speed}s linear infinite`,
            '@keyframes marquee-loop': {
              '0%': {
                transform: `translateX(${direction === 'left' ? '100%' : '-100%'})`,
              },
              '100%': {
                transform: `translateX(${direction === 'left' ? '-100%' : '100%'})`,
              },
            },
          };
  } else if (mode === 'fixed') {
    animationStyles = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: 'hidden',
        width: '100%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        height: '50px',
        position: 'relative',
        border: '1px solid #ccc',
        cursor: pauseOnHover ? 'pointer' : 'default',
      }}
    >
      <Typography
        ref={textRef}
        component="div"
        sx={{
          whiteSpace: 'nowrap',
          color: textColor,
          fontSize,
          display: 'inline-block',
          ...animationStyles,
          ...(pauseOnHover && mode === 'scroll' && !stopInCenter && {
            '&:hover': {
              animationPlayState: 'paused',
            },
          }),
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

Marquee.propTypes = {
  text: PropTypes.string,
  speed: PropTypes.number,
  direction: PropTypes.oneOf(['left', 'right']),
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  fontSize: PropTypes.string,
  pauseOnHover: PropTypes.bool,
  stopInCenter: PropTypes.bool,
  mode: PropTypes.oneOf(['scroll', 'fixed']), // 👈 new prop
};

export default Marquee;
