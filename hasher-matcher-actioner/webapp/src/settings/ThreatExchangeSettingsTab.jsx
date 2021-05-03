/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 */

import React, {useEffect, useState} from 'react';
import Card from 'react-bootstrap/Card';
import PropTypes from 'prop-types';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {CopyableTextField} from '../utils/TextFieldsUtils';
import {
  fetchAllDatasets,
  syncAllDatasets,
  udpateDataset,
  deleteDataset,
} from '../Api';

export default function ThreatExchangeSettingsTab() {
  const [datasets, setDatasets] = useState([]);
  const onPrivacyGroupSave = privacyGroup => {
    udpateDataset(
      privacyGroup.privacyGroupId,
      privacyGroup.localFetcherActive,
      privacyGroup.localWriteBack,
    ).then(response => {
      datasets[
        datasets.findIndex(
          item => item.privacy_group_id === response.privacy_group_id,
        )
      ] = response;
      setDatasets(datasets);
    });
  };
  const onPrivacyGroupDelete = privacyGroupId => {
    deleteDataset(privacyGroupId).then(() => {
      const filteredDatasets = datasets.filter(
        item => item.privacy_group_id !== privacyGroupId,
      );
      setDatasets(filteredDatasets);
    });
  };
  const onSync = () => {
    syncAllDatasets().then(syncResponse => {
      if (syncResponse.response === 'Dataset is update-to-date') {
        fetchAllDatasets().then(response => {
          setDatasets(response.datasets_response);
        });
      } else {
        alert('Errors when syncing privacy groups. Please try again later');
      }
    });
  };
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    fetchAllDatasets().then(response => {
      setDatasets(response.datasets_response);
    });
  }, []);
  return (
    <>
      <Card.Header>
        <Row className="mt-3">
          <h2 className="mt-2">ThreatExchange Privacy Groups </h2>
          <OverlayTrigger
            key="syncButton"
            placement="right"
            overlay={
              <Tooltip id="tooltip-right">
                Fetch privacy groups from ThreatExchange
              </Tooltip>
            }>
            <Button
              variant="primary"
              onClick={() => {
                handleShow();
                onSync();
              }}
              style={{marginLeft: 10}}>
              Sync
            </Button>
          </OverlayTrigger>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Sync ThreatExchange Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Sync process is successfully completed! <br /> Privacy groups is
              up to date
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row className="mt-3">
          {datasets.length === 0
            ? null
            : datasets.map(dataset => (
                <ThreatExchangePrivacyGroupCard
                  key={dataset.privacy_group_id}
                  privacyGroupName={dataset.privacy_group_name}
                  fetcherActive={dataset.fetcher_active}
                  inUse={dataset.in_use}
                  privacyGroupId={dataset.privacy_group_id}
                  writeBack={dataset.write_back}
                  onSave={onPrivacyGroupSave}
                  onDelete={onPrivacyGroupDelete}
                />
              ))}
        </Row>
      </Card.Body>
    </>
  );
}

function ThreatExchangePrivacyGroupCard({
  fetcherActive,
  inUse,
  privacyGroupId,
  privacyGroupName,
  writeBack,
  onSave,
  onDelete,
}) {
  const [originalFetcherActive, setOriginalFetcherActive] = useState(
    fetcherActive,
  );
  const [originalWriteBack, setOriginalWriteBack] = useState(writeBack);
  const [localFetcherActive, setLocalFetcherActive] = useState(fetcherActive);
  const [localWriteBack, setLocalWriteBack] = useState(writeBack);
  const onSwitchFetcherActive = () => {
    setLocalFetcherActive(!localFetcherActive);
  };
  const onSwitchWriteBack = () => {
    setLocalWriteBack(!localWriteBack);
  };
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Col lg={4} sm={6} xs={12} className="mb-4">
        <Card className="text-center">
          <Card.Header
            className={inUse ? 'text-white bg-success' : 'text-white bg-light'}>
            <h4 className="mb-0">
              <CopyableTextField text={privacyGroupName} />
            </h4>
          </Card.Header>
          <Card.Subtitle className="mt-2 mb-2 text-muted">
            <CopyableTextField text={privacyGroupId} />
          </Card.Subtitle>
          <Card.Body className="text-left">
            <Form>
              <Form.Switch
                onChange={onSwitchFetcherActive}
                id={`fetcherActiveSwitch${privacyGroupId}`}
                label="Fetcher Active"
                checked={localFetcherActive}
                disabled={!inUse}
              />
              <Form.Switch
                onChange={onSwitchWriteBack}
                id={`writeBackSwitch${privacyGroupId}`}
                label="Write Back"
                checked={localWriteBack}
                disabled={!inUse}
              />
            </Form>
          </Card.Body>
          <Card.Footer>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Save</Modal.Title>
              </Modal.Header>
              <Modal.Body>Your change is saved!</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
            {localWriteBack === originalWriteBack &&
            localFetcherActive === originalFetcherActive ? null : (
              <div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setOriginalFetcherActive(localFetcherActive);
                    setOriginalWriteBack(localWriteBack);
                    onSave({
                      privacyGroupId,
                      localFetcherActive,
                      localWriteBack,
                    });
                    handleShow();
                  }}>
                  Save
                </Button>
              </div>
            )}
            {inUse ? null : (
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    onDelete(privacyGroupId);
                  }}>
                  Delete
                </Button>
              </div>
            )}
          </Card.Footer>
        </Card>
      </Col>
    </>
  );
}

ThreatExchangePrivacyGroupCard.propTypes = {
  fetcherActive: PropTypes.bool.isRequired,
  inUse: PropTypes.bool.isRequired,
  privacyGroupId: PropTypes.number.isRequired,
  privacyGroupName: PropTypes.string.isRequired,
  writeBack: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
