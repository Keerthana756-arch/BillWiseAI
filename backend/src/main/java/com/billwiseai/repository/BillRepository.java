package com.billwiseai.repository;

import com.billwiseai.model.Bill;
import com.billwiseai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserOrderByBillDateDesc(User user);
    List<Bill> findByUserAndCategoryOrderByBillDateDesc(User user, String category);
    List<Bill> findByUserAndStatusOrderByDueDateAsc(User user, String status);
    Optional<Bill> findByIdAndUser(Long id, User user);
    long countByUser(User user);
    long countByUserAndStatus(User user, String status);
}
