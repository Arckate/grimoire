import React, { HTMLProps, type ReactElement } from 'react';

import classes from './{{name}}.module.scss';

export interface {{name}}Props {
  
}

export default (props: {{name}}Props): ReactElement<{{type}}> => {
  return (
    <{{tag}} className={classes.Root}></{tag}>
  );
}