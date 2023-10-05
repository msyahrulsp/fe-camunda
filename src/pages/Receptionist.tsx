import {
  Box,
  Flex,
  IconButton,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Button,
  Text
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { EditIcon } from '@chakra-ui/icons';

interface Props {
  id: number;
  name: string;
  addr: string;
  is_supply_ok?: number;
  is_valid?: number;
  checkGroup: {
    id: number;
    label: string;
    isChecked: boolean;
    qty: number;
  }[];
}

export const ReceptionistPage = () => {
  const [data, setData] = useState<Props[]>([]);
  const [modalData, setModalData] = useState<Props>();
  const [loading, setLoading] = useState({
    acc: false,
    reject: false
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const submitHandler = async (type: string, id: number | undefined) => {
    setLoading({
      acc: type === 'Acc',
      reject: type === 'Reject'
    });

    try {
      // handle
      console.log('a');
      const is_valid = type === 'Acc' ? 1 : 0;
      const res = await axios.post(`http://localhost:5000/order/${id}/valid`, {is_valid});
      console.log(res);
      onClose();
    } catch (err: unknown) {
      console.log(err);
    }

    setLoading({ acc: false, reject: false });
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/order');
        setData(res.data.order);
        console.log(res);
      } catch (err: unknown) {
        console.log(err);
      }
    };

    fetch();
  }, []);

  return (
    <>
      <Layout title="Receptionist">
        <VStack spacing={2} bg="#FFFFFF99" borderRadius="lg" py={4} px={5}>
          <Box fontSize="lg" color="black" fontWeight="bold">
            List Order
          </Box>
          <Flex
            flexDir="column"
            justifyContent="center"
            alignItems="flex-start"
            gap={4}
          >
            {data.length > 0 ? (
              data.map((item: Props, idx: number) => (
                <Flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  key={idx}
                  gap={10}
                  w="100%"
                >
                  <VStack spacing={0} alignItems="flex-start">
                    <Box fontSize="lg" color="black">
                      ID:{' '}
                      <Box as="span" fontWeight="bold">
                        {item.id}
                      </Box>
                    </Box>
                    <Box fontSize="lg" color="black">
                      Nama:{' '}
                      <Box as="span" fontWeight="bold">
                        {item.name}
                      </Box>
                    </Box>
                    <Box fontSize="lg" color="black">
                      Alamat:{' '}
                      <Box as="span" fontWeight="bold">
                        {item.addr}
                      </Box>
                    </Box>
                    {
                      item.is_valid !== undefined && (
                        <Box fontSize="lg" color="black">
                          Status:{' '}
                          <Box as="span" fontWeight="bold">
                            {item.is_valid ? 'Accepted' : 'Rejected'}
                          </Box>
                        </Box>
                      )
                    }
                  </VStack>
                  {
                    item.is_valid === undefined && (
                      <IconButton
                        colorScheme="green"
                        aria-label="Edit"
                        icon={<EditIcon />}
                        onClick={() => {
                          onOpen();
                          setModalData(item);
                        }}
                      />
                    )
                  }
                </Flex>
              ))
            ) : (
              <Text fontSize="lg" color="black">
                Belum ada pesanan
              </Text>
            )}
          </Flex>
        </VStack>
      </Layout>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <VStack spacing={0} alignItems="flex-start">
              <Box fontSize="lg" color="black">
                ID:{' '}
                <Box as="span" fontWeight="bold">
                  {modalData?.id}
                </Box>
              </Box>
              <Box fontSize="lg" color="black">
                Nama:{' '}
                <Box as="span" fontWeight="bold">
                  {modalData?.name}
                </Box>
              </Box>
              <Box fontSize="lg" color="black">
                Alamat:{' '}
                <Box as="span" fontWeight="bold">
                  {modalData?.addr}
                </Box>
              </Box>
              <Box fontSize="lg" color="black" fontWeight="bold" mt={2}>
                Pembelian
              </Box>
              {modalData?.checkGroup
                .filter((item) => item.isChecked)
                .map((item, idx: number) => (
                  <Flex
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    key={idx}
                    w="100%"
                  >
                    <Box fontSize="lg" color="black">
                      {item.label}
                    </Box>
                    <Box fontSize="lg" color="black">
                      {item.qty}
                    </Box>
                  </Flex>
                ))}
            </VStack>

            <Flex
              flexDir="row"
              justifyContent="center"
              alignItems="center"
              gap={4}
              mt={4}
            >
              <Button
                colorScheme="blue"
                onClick={() => submitHandler('Acc', modalData?.id)}
                isLoading={loading.acc}
                isDisabled={loading.reject}
              >
                Acc Orddr
              </Button>
              <Button
                colorScheme="red"
                onClick={() => submitHandler('Reject', modalData?.id)}
                isLoading={loading.reject}
                isDisabled={loading.acc}
              >
                Reject Order
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
