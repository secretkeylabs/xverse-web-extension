import React, { Component, FC, useEffect, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector as useReduxSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RequestInterface } from './background';
import { StoreState } from '@stores/index';
import { actionError } from '@stores/dlc/actions/actionCreators';
import { offerRequest } from '@stores/dlc/actions/actionCreators';

export const PopupHandler: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dlcError = useSelector((state: StoreState) => state.dlcState.error);
  const success = useSelector((state: StoreState) => state.dlcState.actionSuccess);
  const currContractId = useSelector((state: StoreState) => state.dlcState.currentId);
  const [displayError, setDisplayError] = useState(true);
  const [processRequested, setProcessRequested] = useState(false);

  useEffect(() => {
    if (displayError && dlcError) {
      console.log('error')
      setDisplayError(false);
    }
    dispatch(actionError({ error: '' }));
  }, [displayError, dlcError, dispatch]);

  useEffect(() => {
    if (processRequested && success) {
      navigate(`popup.html`);
      setProcessRequested(false);
    }
  });

  const handleProcessClicked = (message: string): void => {
    setProcessRequested(true);
    dispatch(offerRequest(message));
  };

  chrome.runtime.onMessage.addListener((request: RequestInterface, sender, sendResponse) => {
    if (request.action == 'get-offer-internal') {
        console.log('Im In')
      handleProcessClicked(JSON.stringify(request.data.offer));
      sendResponse('[PopUpHandler]: Heard get-offer-internal');
    }
    sendResponse('[PopUpHandler]: Invalid request.action');
  });

  return <></>
};
