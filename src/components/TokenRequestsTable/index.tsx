"use client"; // Required for Next.js App Router if using hooks

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {Table, Input, Button, DatePicker, DatePickerProps, Tooltip, notification} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import './index.scss';
import { exportToExcel, formatDate, getDocumentName } from "@/lib/commonFunction";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {deleteToken, TokenRequest as TokenInput, TokenRequest, updateToken} from "@/redux/slices/tokens";
import paymentDoneImage from '@/assets/payment-done.png'
import returnDoneImage from '@/assets/return-done.png'
import viewDetailIcon from '@/assets/view-detail.png'
import editIcon from '@/assets/edit-icon.png'
import deleteIcon from '@/assets/delete-icon.png'
import excelIcon from '@/assets/export-excel-icon.png'
import Image from "next/image";
import CreateTokenModal from "./CreateToken";
import TokenConfirmationModal from "./ConfirmationModal";
import { isEmpty, sortBy } from "lodash";

// Define the required types
export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

const TokenRequestTable = ({ tokenRequests }: { tokenRequests: TokenRequest[] }) => {
  const [data, setData] = useState<TokenRequest[]>([]);
  const [filteredData, setFilteredData] = useState<TokenRequest[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenInput>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<TokenInput>({})
  const { tokens, loading } = useSelector((state: RootState) => state.tokens);
  const [api, contextHolder] = notification.useNotification();

  const dispatch: AppDispatch = useDispatch();

  // Fetch data from API
  useEffect(() => {
    setData(tokenRequests);
    setFilteredData(tokenRequests);    
  }, [tokenRequests]);

  // Search function
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = data.filter(
      (item) =>
        String(item.tokenNumber).includes(value) ||
        item.name?.toLowerCase().includes(value.toLowerCase()) ||
        item.documentType?.toLowerCase().includes(value.toLowerCase()) ||
        item.mobileNumber?.includes(value) ||
        item.userDetail?.email.toLowerCase().includes(value.toLowerCase()) ||
        item.paymentMode?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const showModal = () => setIsModalOpen(true);

  // Close modal
  
  const handlePaymentDone = async (tokenId: string) => {
    if (tokenId) {
      await dispatch(updateToken({ tokenId, data: { isPaymentDone: true } })).unwrap();
    }
  }

  const handleReturnDone = async (tokenId: string) => {
    if (tokenId) {
      await dispatch(updateToken({ tokenId, data: { isReturn: true } })).unwrap();
    }
  }

  const handleDeleteToken = async (tokenId: string) => {
    const response = await dispatch(deleteToken(tokenId)).unwrap();
    if(response.tokenId) {
      api.success({
        message: '',
        description: response.message,
      })
    }
  }

  const handleActionClick = async (tokenData: TokenRequest, type: string) => {
    switch(type) {
      case 'view_detail':
        setTokenDetails(tokenData);
        setConfirmationModal(true);
        break;

      case 'edit_icon':
        setEditData(tokenData);
        setIsEditMode(true);
        setIsModalOpen(true);
        break;
      case 'delete_icon':
        if(tokenData.id) {
          await handleDeleteToken(tokenData.id);
        }
        break;
      default:
        return;
    }
  }

  // Table columns
  const columns: ColumnsType<TokenRequest> = [
    {
      title: "Token No.",
      dataIndex: "tokenNumber",
      key: "tokenNumber",
      align: 'center',
      width: 100,
      fixed: true,
      sorter: (a, b) => (a.tokenNumber as number) - (b.tokenNumber as number),
    },
    {
      title: "Token Date",
      dataIndex: "createdAt",
      align: 'center',
      key: "createdAt",
      render: (date) => formatDate(date),      
    },
    {
      title: "Name",
      dataIndex: "name",
      align: 'center',
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name as string) || 0,
    },
    {
      title: "Document Type",
      align: 'center',
      dataIndex: "documentType",
      key: "documentType",
      render: (documentType) => getDocumentName(documentType),
    },
    {
      title: "Mobile Number",
      align: 'center',
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "User",
      align: 'center',
      dataIndex: ["userDetail", "name"],
      key: "userDetail",
      render: (_, record) => record.userDetail?.email.replace('@pannishthafoundation.com', '') || "N/A",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      align: 'center',
      width: 150,
      key: "paymentMode",
      filters: [
        { text: "Cash", value: "CASH" },
        { text: "Online", value: "ONLINE" },
        { text: "Free", value: "FREE" },
        { text: "Pending", value: "PENDING" },
      ],
      onFilter: (value, record) => record.paymentMode === value,
    },
    {
      title: "Payment (જમા)",
      align: 'center',
      dataIndex: "isPaymentDone",
      fixed: 'right',
      key: "isPaymentDone",
      width: 120,
      render: (isPaymentDone, record) => (isPaymentDone 
        ? <Image alt='payment-done' src={paymentDoneImage} height={32} width={32} />
        : <Button className='payment-done-btn' onClick={() => handlePaymentDone(record.id as string)}>જમા</Button>),
    },
    {
      title: "Document Return",
      align: 'center',
      dataIndex: "isReturn",
      key: "isReturn",
      fixed: 'right',
      width: 100,
      render: (isReturn, record) => (isReturn 
        ? <Image alt='payment-done' src={returnDoneImage} height={32} width={32} />
        : <Button type="primary" danger onClick={() => handleReturnDone(record.id as string)}>Return</Button>),
    },
    {
      title: "Actions",
      align: 'center',
      dataIndex: "action",
      key: "action",
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className='action-container'>
          <Image className='view-detail' alt='payment-done' src={viewDetailIcon} onClick={() => handleActionClick(record, 'view_detail')}  height={25} width={22} />
          <Image className='view-detail' alt='payment-done' src={editIcon} onClick={() => handleActionClick(record, 'edit_icon')}  height={25} width={25} />
          <Image className='view-detail' alt='payment-done' src={deleteIcon} onClick={() => handleActionClick(record, 'delete_icon')}  height={25} width={25} />
        </div>
      ),
    },
  ];

  const onChange: DatePickerProps['onChange'] = (_, dateString) => {
    if(dateString) {
      const filtered = data.filter(
        (item) => {
          const selectedDate = new Date(item.createdAt as Date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
  
          return selectedDate === dateString;
        }
          
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleExportExcel = () => {
    if(!isEmpty(tokens)) {
      const fileName = `Token_${formatDate(new Date())}`
      const data = sortBy(tokens, 'tokenNumber').map(value => ({
        tokenNumber: String(value.tokenNumber) || '',
        name: value.name || '',
        mobileNumber: String(value.mobileNumber) || '',
        paymentType: value.paymentMode || '',
        amount: String(value.amount) || '',
        documentType: value.documentType ? getDocumentName(value.documentType) : '',
        payment: value.isPaymentDone ? 'Done' : 'Pending'
      }))
      exportToExcel(data, fileName);
    }
  }

  return (
    <div className='tokens-table-container'>
      {contextHolder}
      <div className='search-bar-continer' style={{ margin: '16px auto' }}>
        <Input
          className='search-bar'
          placeholder="Search by Name, Document Type, Mobile, User, or Payment Mode"
          value={searchText}
          suffix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />

        <DatePicker className='date-picker' onChange={onChange} format={'DD/MM/YYYY'} />

        <Tooltip title='Export Excel' placement='bottom'>
          <Image className='excel-icon' alt="excel" src={excelIcon} height={40} width={40} onClick={handleExportExcel} />
        </Tooltip>

        <Button className='create-btn' type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Create Token
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: filteredData.length || 10 }}
        rowKey="id"
        scroll={{
          x: 'max-content',
          y: 'calc(100vh - 250px)',
        }}
      />

      <CreateTokenModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setConfirmationModal={setConfirmationModal}
        setTokenDetails={setTokenDetails}
        isEditMode={isEditMode}
        setEditData={setEditData}
        formData={editData}
        setIsEditMode={setIsEditMode}
       />
      <TokenConfirmationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        tokenDetails={tokenDetails}
        setTokenDetails={setTokenDetails}
      />
    </div>
  );
};

export default TokenRequestTable;
