import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  VStack,
  useToast
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useFieldArray, useForm } from 'react-hook-form';
import { BaseSyntheticEvent, useState } from 'react';
import axios from 'axios';

interface FormValue {
  name: string;
  addr: string;
  checkGroup: {
    id: number;
    label: string;
    isChecked: boolean;
    qty: number;
  }[];
}

export const CustomerPage = () => {
  const { register, handleSubmit, control, watch, formState } = useForm({
    defaultValues: {
      name: '',
      addr: '',
      checkGroup: [
        { id: 1, label: 'Ayam Goreng', isChecked: false, qty: 0 },
        { id: 2, label: 'Nasi Goreng', isChecked: false, qty: 0 },
        { id: 3, label: 'Orak Arik Osis', isChecked: false, qty: 0 },
        { id: 4, label: 'Omelet Sosis', isChecked: false, qty: 0 }
      ]
    }
  });
  const { fields } = useFieldArray({
    control,
    name: 'checkGroup',
    rules: {
      validate: (value) => {
        const isChecked = value.some((item) => item.isChecked);
        if (!isChecked) {
          return 'Pilih minimal 1 menu';
        }

        const isQtyValid = value
          .filter((item) => item.isChecked)
          .every((item) => item.qty > 0);

        if (!isQtyValid) {
          return 'Qty tidak boleh 0';
        }
        return true;
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submitHandler = async (data: FormValue) => {
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/order', data=data);
      console.log(res);
      toast({
        description: "Pesanan berhasil dibuat",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      })
    } catch (err: unknown) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <Layout title="Customer">
      <VStack
        spacing={2}
        bg="#FFFFFF99"
        borderRadius="lg"
        py={4}
        px={5}
        alignItems="flex-start"
        w="50ch"
      >
        <VStack spacing={2} w="full">
          <Box fontSize="lg" color="black" fontWeight="bold">
            Pemesan
          </Box>
          <FormControl isInvalid={!!formState.errors.name}>
            <Input
              {...register('name', {
                required: { value: true, message: 'Nama tidak boleh kosong' }
              })}
              type="text"
              placeholder="Nama"
            />
            {formState.errors.name && (
              <FormErrorMessage>
                {formState.errors.name.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!formState.errors.addr}>
            <Input
              {...register('addr', {
                required: { value: true, message: 'Alamat tidak boleh kosong' }
              })}
              type="text"
              placeholder="Alamat"
            />
            {formState.errors.addr && (
              <FormErrorMessage>
                {formState.errors.addr.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </VStack>
        <Box fontSize="lg" color="black" fontWeight="bold" mt={4}>
          List Menu
        </Box>
        <FormControl isInvalid={!!formState.errors.checkGroup}>
          {fields.map((field, index) => {
            const checked = watch(`checkGroup.${index}.isChecked` as const);
            return (
              <Flex
                justifyContent="space-between"
                alignItems="center"
                key={field.id}
                w="100%"
              >
                <Checkbox
                  {...register(`checkGroup.${index}.isChecked` as const)}
                  colorScheme="blue"
                  pr={10}
                >
                  {field.label}
                </Checkbox>
                <Input
                  {...register(`checkGroup.${index}.qty` as const)}
                  type="number"
                  placeholder="Qty"
                  w="50px"
                  ml="auto"
                  textAlign="center"
                  isDisabled={!checked}
                />
              </Flex>
            );
          })}
          {formState.errors.checkGroup && (
            <FormErrorMessage>
              {formState.errors.checkGroup.root?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <Button
          colorScheme="green"
          alignSelf="center"
          w="50%"
          onClick={(e: BaseSyntheticEvent) => handleSubmit(submitHandler)(e)}
          isLoading={loading}
        >
          Pesan
        </Button>
      </VStack>
    </Layout>
  );
};
