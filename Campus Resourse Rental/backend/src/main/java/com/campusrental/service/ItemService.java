package com.campusrental.service;

import com.campusrental.dto.*;
import com.campusrental.entity.*;
import com.campusrental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository   itemRepo;
    private final UserRepository   userRepo;
    private final CategoryRepository categoryRepo;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional(readOnly = true) 
    public Page<ItemSummaryDTO> searchItems(Long categoryId, String campus,
            BigDecimal minPrice, BigDecimal maxPrice, String search, Pageable pageable) {
        return itemRepo.searchAvailable(categoryId, campus, minPrice, maxPrice, search, pageable)
            .map(this::toSummaryDTO);
    }

    public List<ItemMapDTO> getMapItems(String campus, Long categoryId) {
        return itemRepo.findForMap(campus, categoryId).stream()
            .map(i -> new ItemMapDTO(
                i.getItemId(), i.getTitle(), i.getDailyPrice(),
                i.getLatitude().doubleValue(), i.getLongitude().doubleValue(),
                i.getLocationLabel(), i.getCategory().getName(),
                i.getImageUrls().isEmpty() ? null : i.getImageUrls().get(0)))
            .toList();
    }

    @Transactional(readOnly = true)
    public ItemDetailDTO getItemDetail(Long id) {
        Item item = itemRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Item not found: " + id));
        return toDetailDTO(item);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        itemRepo.incrementViewCount(id);
    }

    @Transactional
    public ItemDetailDTO createItem(String ownerEmail, CreateItemRequest req, List<MultipartFile> images) {
        User owner    = userRepo.findByEmailId(ownerEmail).orElseThrow();
        Category cat  = categoryRepo.findById(req.categoryId()).orElseThrow();

        List<String> savedImages = saveImages(images);

        Item item = Item.builder()
            .owner(owner)
            .category(cat)
            .title(req.title())
            .description(req.description())
            .dailyPrice(req.dailyPrice())
            .securityDeposit(req.securityDeposit())
            .conditionRating(req.conditionRating())
            .latitude(req.latitude())
            .longitude(req.longitude())
            .locationLabel(req.locationLabel())
            .campusName(owner.getCampusName())
            .imageUrls(savedImages)
            .tags(req.tags() != null ? req.tags() : List.of())
            .build();

        return toDetailDTO(itemRepo.save(item));
    }

    @Transactional
    public ItemDetailDTO updateItem(String ownerEmail, Long itemId, UpdateItemRequest req) {
        Item item = getOwnedItem(ownerEmail, itemId);
        if (req.title()       != null) item.setTitle(req.title());
        if (req.description() != null) item.setDescription(req.description());
        if (req.dailyPrice()  != null) item.setDailyPrice(req.dailyPrice());
        if (req.locationLabel()!= null) item.setLocationLabel(req.locationLabel());
        return toDetailDTO(itemRepo.save(item));
    }

    @Transactional
    public void updateStatus(String email, Long id, Item.Status status) {
        Item item = getOwnedItem(email, id);
        item.setStatus(status);
        itemRepo.save(item);
    }

    @Transactional
    public void removeItem(String email, Long id) {
        Item item = getOwnedItem(email, id);
        item.setStatus(Item.Status.REMOVED);
        itemRepo.save(item);
    }

    @Transactional(readOnly = true)
    public List<ItemSummaryDTO> getOwnerItems(String email) {
        return itemRepo.findByOwner_EmailIdOrderByCreatedAtDesc(email)
            .stream().map(this::toSummaryDTO).toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private Item getOwnedItem(String email, Long itemId) {
        Item item = itemRepo.findById(itemId)
            .orElseThrow(() -> new NoSuchElementException("Item not found"));
        if (!item.getOwner().getEmailId().equals(email)) {
            throw new SecurityException("Not your item");
        }
        return item;
    }

    private List<String> saveImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return List.of();
        List<String> urls = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            for (MultipartFile file : files) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
                urls.add("/uploads/" + filename);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save images", e);
        }
        return urls;
    }

    private ItemSummaryDTO toSummaryDTO(Item i) {
        return new ItemSummaryDTO(
            i.getItemId(), i.getTitle(), i.getDailyPrice(), i.getSecurityDeposit(),
            i.getConditionRating().name(), i.getStatus().name(),
            i.getCategory().getName(), i.getCategory().getIcon(),
            i.getOwner().getFullName(), i.getOwner().getRatingAvg(),
            i.getLocationLabel(), i.getCampusName(),
            i.getImageUrls().isEmpty() ? null : i.getImageUrls().get(0),
            i.getCreatedAt());
    }

    private ItemDetailDTO toDetailDTO(Item i) {
        return new ItemDetailDTO(
            i.getItemId(), i.getTitle(), i.getDescription(),
            i.getDailyPrice(), i.getSecurityDeposit(),
            i.getConditionRating().name(), i.getStatus().name(),
            i.getCategory().getCategoryId(), i.getCategory().getName(),
            i.getOwner().getUserId(), i.getOwner().getFullName(),
            i.getOwner().getRatingAvg(), i.getOwner().isVerified(),
            i.getLatitude(), i.getLongitude(), i.getLocationLabel(), i.getCampusName(),
            i.getImageUrls(), i.getTags(), i.getViewCount(), i.getCreatedAt());
    }
}
